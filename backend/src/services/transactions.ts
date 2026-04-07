/**
 * src/services/transactions.ts
 *
 * Lógica de negócio para transações — o core do FinTrack.
 *
 * CONCEITOS CRÍTICOS IMPLEMENTADOS:
 *
 * 1. IDEMPOTÊNCIA (Idempotency-Key):
 *    O frontend envia um UUID gerado antes de submeter o formulário.
 *    Se a mesma key chegar duas vezes (duplo clique, retry de rede),
 *    retornamos a transação original em vez de criar uma duplicata.
 *    A key fica armazenada no campo `idempotencyKey` da transação.
 *
 * 2. SOFT DELETE:
 *    Transações nunca são deletadas fisicamente. O campo `deletedAt`
 *    é preenchido. Todas as queries filtram `deletedAt: null`.
 *
 * 3. ANTI-IDOR (ownership):
 *    Todo acesso filtra por userId que vem do JWT.
 *    Nunca confiamos em IDs de URL sem verificar o userId.
 *    Se o registro não pertencer ao usuário → 404 (não 403),
 *    para não revelar que o ID existe (evita enumeration attack).
 *
 * 4. GROUP BY NO BANCO (não no Node):
 *    O summary (saldo, totais por categoria) é calculado com
 *    aggregações SQL — não trazemos todas as transações para somar no JS.
 *    Isso é crítico para usuários com muitas transações.
 *
 * 5. DECIMAL como string:
 *    O Prisma retorna Decimal como objeto string-like.
 *    A operação `+` causaria concatenação, não soma.
 *    Usamos String() para serializar corretamente no JSON.
 */

import { prisma } from "../lib/prisma.js"
import type { TxType } from "@prisma/client"

// ─── Tipos de entrada ─────────────────────────────────────────────────────────

export type CreateTransactionInput = {
  description: string
  amount: number
  type: TxType
  date: string          // ISO 8601 — vem do frontend com T12:00:00Z
  notes?: string
  categoryId: string
  subcategoryId?: string
  idempotencyKey?: string
}

export type UpdateTransactionInput = Partial<Omit<CreateTransactionInput, "idempotencyKey">>

export type ListTransactionsInput = {
  month?: string        // "YYYY-MM" — filtro principal da UI
  type?: TxType
  categoryId?: string
  page?: number
  limit?: number
}

// ─── Operações públicas ───────────────────────────────────────────────────────

/**
 * Lista transações do usuário com filtros e paginação.
 *
 * O filtro por mês converte "YYYY-MM" em um range de datas:
 *   "2026-03" → gte: 2026-03-01T00:00:00Z, lt: 2026-04-01T00:00:00Z
 *
 * Por que não usar LIKE '2026-03%' no campo date?
 * Porque `date` é DateTime, não String. O range é mais eficiente
 * e usa os índices @@index([userId, date]) do schema.
 *
 * Paginação: padrão 10 itens por página.
 * O `take` explícito no findMany é obrigatório (regra do plano):
 * queries sem limite causam full table scan em produção.
 */
export async function listTransactions(
  userId: string,
  filters: ListTransactionsInput = {}
) {
  const { month, type, categoryId, page = 1, limit = 10 } = filters

  // Monta o filtro de data a partir do mês (se fornecido)
  let dateFilter: { gte?: Date; lt?: Date } = {}
  if (month) {
    const [year, monthNum] = month.split("-").map(Number)
    dateFilter = {
      gte: new Date(year, monthNum - 1, 1),    // primeiro dia do mês
      lt: new Date(year, monthNum, 1),          // primeiro dia do mês seguinte
    }
  }

  const where = {
    userId,
    deletedAt: null,
    ...(Object.keys(dateFilter).length > 0 && { date: dateFilter }),
    ...(type && { type }),
    ...(categoryId && { categoryId }),
  }

  // Executa contagem e busca em paralelo — uma única viagem ao banco
  const [total, transactions] = await Promise.all([
    prisma.transaction.count({ where }),
    prisma.transaction.findMany({
      where,
      include: {
        category: {
          select: { id: true, name: true, icon: true, color: true },
        },
        subcategory: {
          select: { id: true, name: true, icon: true },
        },
      },
      orderBy: { date: "desc" }, // mais recentes primeiro
      skip: (page - 1) * limit,
      take: limit,               // OBRIGATÓRIO: sempre limitar a query
    }),
  ])

  return {
    data: transactions,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}

/**
 * Cria uma transação com suporte a idempotência.
 *
 * FLUXO DE IDEMPOTÊNCIA:
 *   1. Se idempotencyKey foi enviada, busca transação existente com essa key.
 *   2. Se encontrar → retorna a transação existente (sem criar duplicata).
 *   3. Se não encontrar → cria normalmente, salvando a key.
 *
 * O campo `idempotencyKey` tem @unique no schema, então uma segunda
 * criação com a mesma key falharia no banco de qualquer forma.
 * A busca prévia evita o erro e retorna o resultado correto.
 */
export async function createTransaction(
  userId: string,
  input: CreateTransactionInput
) {
  // Verifica idempotência: se a key já existe, retorna a transação original
  if (input.idempotencyKey) {
    const existing = await prisma.transaction.findUnique({
      where: { idempotencyKey: input.idempotencyKey },
      include: {
        category: { select: { id: true, name: true, icon: true, color: true } },
        subcategory: { select: { id: true, name: true, icon: true } },
      },
    })
    // Retorna a existente SOMENTE se pertencer ao mesmo usuário (segurança)
    if (existing && existing.userId === userId) {
      return existing
    }
  }

  return prisma.transaction.create({
    data: {
      description: input.description,
      amount: input.amount,
      type: input.type,
      date: new Date(input.date),
      notes: input.notes,
      userId,
      categoryId: input.categoryId,
      subcategoryId: input.subcategoryId,
      idempotencyKey: input.idempotencyKey,
    },
    include: {
      category: { select: { id: true, name: true, icon: true, color: true } },
      subcategory: { select: { id: true, name: true, icon: true } },
    },
  })
}

/**
 * Atualiza uma transação do usuário.
 *
 * O userId garante que só o dono pode atualizar.
 * Se não encontrar → 404 (não 403, para evitar enumeration de IDs).
 */
export async function updateTransaction(
  id: string,
  userId: string,
  input: UpdateTransactionInput
) {
  // Verifica existência e ownership
  const existing = await prisma.transaction.findFirst({
    where: { id, userId, deletedAt: null },
  })

  if (!existing) {
    const error = new Error("Transação não encontrada.") as any
    error.code = "NOT_FOUND"
    error.statusCode = 404
    throw error
  }

  return prisma.transaction.update({
    where: { id },
    data: {
      ...(input.description !== undefined && { description: input.description }),
      ...(input.amount !== undefined && { amount: input.amount }),
      ...(input.type !== undefined && { type: input.type }),
      ...(input.date !== undefined && { date: new Date(input.date) }),
      ...(input.notes !== undefined && { notes: input.notes }),
      ...(input.categoryId !== undefined && { categoryId: input.categoryId }),
      // subcategoryId pode ser null explicitamente (remover subcategoria)
      ...(input.subcategoryId !== undefined && { subcategoryId: input.subcategoryId }),
    },
    include: {
      category: { select: { id: true, name: true, icon: true, color: true } },
      subcategory: { select: { id: true, name: true, icon: true } },
    },
  })
}

/**
 * Remove uma transação via soft delete.
 *
 * Preenche deletedAt em vez de deletar o registro.
 * Isso permite auditoria futura e evita perda acidental de dados.
 */
export async function deleteTransaction(id: string, userId: string) {
  const existing = await prisma.transaction.findFirst({
    where: { id, userId, deletedAt: null },
  })

  if (!existing) {
    const error = new Error("Transação não encontrada.") as any
    error.code = "NOT_FOUND"
    error.statusCode = 404
    throw error
  }

  return prisma.transaction.update({
    where: { id },
    data: { deletedAt: new Date() },
  })
}

/**
 * Calcula o resumo financeiro do mês para o dashboard.
 *
 * TUDO calculado no banco via GROUP BY e SUM — nunca no Node.
 * Isso é crítico: um usuário com 10.000 transações não deve
 * trazer todos os registros para o Node calcular.
 *
 * Retorna:
 *   - totalIncome: soma de todas as receitas do mês
 *   - totalExpense: soma de todas as despesas do mês
 *   - balance: receitas - despesas
 *   - byCategory: totais agrupados por categoria (para o gráfico de pizza)
 */
export async function getTransactionSummary(userId: string, month: string) {
  const [year, monthNum] = month.split("-").map(Number)
  const startDate = new Date(year, monthNum - 1, 1)
  const endDate = new Date(year, monthNum, 1)

  const baseWhere = {
    userId,
    deletedAt: null,
    date: { gte: startDate, lt: endDate },
  }

  // Executa as três queries em paralelo para minimizar latência
  const [incomeResult, expenseResult, byCategory] = await Promise.all([
    // Soma total de receitas
    prisma.transaction.aggregate({
      where: { ...baseWhere, type: "income" },
      _sum: { amount: true },
    }),

    // Soma total de despesas
    prisma.transaction.aggregate({
      where: { ...baseWhere, type: "expense" },
      _sum: { amount: true },
    }),

    // Totais agrupados por categoria (para o gráfico de pizza)
    // groupBy não suporta include, então buscamos as categorias separadamente
    prisma.transaction.groupBy({
      by: ["categoryId", "type"],
      where: baseWhere,
      _sum: { amount: true },
      orderBy: { _sum: { amount: "desc" } },
    }),
  ])

  // Converte Decimal para number para cálculos seguros
  const totalIncome = Number(incomeResult._sum.amount ?? 0)
  const totalExpense = Number(expenseResult._sum.amount ?? 0)

  // Busca os dados das categorias que aparecem no summary
  const categoryIds = [...new Set(byCategory.map((r) => r.categoryId))]
  const categories = await prisma.category.findMany({
    where: { id: { in: categoryIds } },
    select: { id: true, name: true, icon: true, color: true },
  })

  const categoryMap = new Map(categories.map((c) => [c.id, c]))

  // Agrupa por categoria (junta income e expense da mesma categoria)
  const categoryTotals = new Map<
    string,
    { income: number; expense: number; category: (typeof categories)[0] }
  >()

  for (const row of byCategory) {
    const cat = categoryMap.get(row.categoryId)
    if (!cat) continue

    const existing = categoryTotals.get(row.categoryId) ?? {
      income: 0,
      expense: 0,
      category: cat,
    }

    if (row.type === "income") {
      existing.income += Number(row._sum.amount ?? 0)
    } else {
      existing.expense += Number(row._sum.amount ?? 0)
    }

    categoryTotals.set(row.categoryId, existing)
  }

  // Formata o resultado final
  const byCategoryFormatted = Array.from(categoryTotals.values()).map((item) => ({
    categoryId: item.category.id,
    categoryName: item.category.name,
    categoryColor: item.category.color,
    categoryIcon: item.category.icon,
    totalIncome: item.income.toFixed(2),
    totalExpense: item.expense.toFixed(2),
    // Percentual sobre o total de despesas (útil para o gráfico de pizza)
    percentage:
      totalExpense > 0
        ? parseFloat(((item.expense / totalExpense) * 100).toFixed(1))
        : 0,
  }))

  return {
    month,
    totalIncome: totalIncome.toFixed(2),
    totalExpense: totalExpense.toFixed(2),
    balance: (totalIncome - totalExpense).toFixed(2),
    byCategory: byCategoryFormatted,
  }
}
