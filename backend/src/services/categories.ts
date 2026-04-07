/**
 * src/services/categories.ts
 *
 * Lógica de negócio para categorias.
 *
 * REGRAS DE NEGÓCIO IMPORTANTES:
 *
 * 1. OWNERSHIP: todo acesso filtra por userId — vem do JWT, nunca do body.
 *    Isso implementa o princípio anti-IDOR descrito no plano.
 *
 * 2. SOFT DELETE: categorias nunca são deletadas fisicamente. O campo
 *    `deletedAt` é preenchido. Todas as queries incluem `deletedAt: null`.
 *    Isso evita perda acidental e mantém integridade dos dados históricos.
 *
 * 3. PROTEÇÃO CONTRA EXCLUSÃO: categorias com transações vinculadas não
 *    podem ser deletadas. O frontend recebe erro semântico CATEGORY_IN_USE.
 *
 * 4. SLUG: identificador estável para URLs. Gerado automaticamente a partir
 *    do nome se não fornecido. Único por usuário (@@unique([slug, userId])).
 */

import { prisma } from "../lib/prisma.js"

// ─── Tipos de entrada ─────────────────────────────────────────────────────────

export type CreateCategoryInput = {
  name: string
  icon: string
  color: string
  slug?: string // opcional: gerado automaticamente se ausente
}

export type UpdateCategoryInput = Partial<CreateCategoryInput>

// ─── Helpers privados ─────────────────────────────────────────────────────────

/**
 * Converte nome em slug URL-friendly.
 * "Cartão de Crédito" → "cartao-de-credito"
 */
function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")                    // separa acentos dos caracteres
    .replace(/[\u0300-\u036f]/g, "")     // remove os acentos
    .replace(/[^a-z0-9\s-]/g, "")       // remove caracteres especiais
    .trim()
    .replace(/\s+/g, "-")               // espaços → hífens
}

// ─── Operações públicas ───────────────────────────────────────────────────────

/**
 * Lista todas as categorias ativas do usuário, com suas subcategorias.
 *
 * Inclui subcategorias que também não foram deletadas (deletedAt: null).
 * Ordenado por nome para exibição consistente na UI.
 */
export async function listCategories(userId: string) {
  return prisma.category.findMany({
    where: {
      userId,
      deletedAt: null, // soft delete: exclui categorias removidas
    },
    include: {
      subcategories: {
        where: { deletedAt: null }, // idem para subcategorias
        orderBy: { name: "asc" },
      },
    },
    orderBy: { name: "asc" },
  })
}

/**
 * Busca uma categoria específica do usuário pelo id.
 *
 * Retorna null se não encontrada OU se pertencer a outro usuário.
 * Isso implementa o anti-IDOR: mesmo que o ID exista no banco,
 * só retorna se o userId bater — impossibilita acesso cruzado.
 */
export async function getCategoryById(id: string, userId: string) {
  return prisma.category.findFirst({
    where: {
      id,
      userId,          // OBRIGATÓRIO: dupla verificação de ownership
      deletedAt: null,
    },
    include: {
      subcategories: {
        where: { deletedAt: null },
        orderBy: { name: "asc" },
      },
    },
  })
}

/**
 * Cria uma categoria para o usuário.
 *
 * O slug é gerado automaticamente a partir do nome se não fornecido.
 * Se o slug gerado já existir para este usuário, lança erro de conflito
 * (tratado pelo errorHandler via Prisma P2002 unique constraint).
 */
export async function createCategory(userId: string, input: CreateCategoryInput) {
  const slug = input.slug ?? nameToSlug(input.name)

  return prisma.category.create({
    data: {
      slug,
      name: input.name,
      icon: input.icon,
      color: input.color,
      userId,
    },
    include: {
      subcategories: {
        where: { deletedAt: null },
      },
    },
  })
}

/**
 * Atualiza uma categoria do usuário.
 *
 * Verifica ownership antes de atualizar (anti-IDOR).
 * Se a categoria não existir ou pertencer a outro usuário → lança NOT_FOUND.
 * Se o novo slug colidir com outro existente → Prisma lança P2002 (conflito).
 */
export async function updateCategory(
  id: string,
  userId: string,
  input: UpdateCategoryInput
) {
  // Verifica existência e ownership antes de tentar atualizar
  const existing = await getCategoryById(id, userId)
  if (!existing) {
    const error = new Error("Categoria não encontrada.") as any
    error.code = "NOT_FOUND"
    error.statusCode = 404
    throw error
  }

  // Recalcula slug se o nome foi alterado e slug não foi fornecido explicitamente
  const slug = input.slug ?? (input.name ? nameToSlug(input.name) : undefined)

  return prisma.category.update({
    where: { id },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.icon !== undefined && { icon: input.icon }),
      ...(input.color !== undefined && { color: input.color }),
      ...(slug !== undefined && { slug }),
    },
    include: {
      subcategories: {
        where: { deletedAt: null },
        orderBy: { name: "asc" },
      },
    },
  })
}

/**
 * Remove uma categoria via soft delete.
 *
 * PROTEÇÃO: bloqueia se houver transações ativas vinculadas.
 * Isso garante integridade dos dados financeiros: não é possível
 * "orphanar" transações removendo sua categoria.
 *
 * Lança CATEGORY_IN_USE (409) se houver transações.
 * Lança NOT_FOUND (404) se a categoria não existir ou pertencer a outro.
 */
export async function deleteCategory(id: string, userId: string) {
  // Verifica existência e ownership
  const existing = await getCategoryById(id, userId)
  if (!existing) {
    const error = new Error("Categoria não encontrada.") as any
    error.code = "NOT_FOUND"
    error.statusCode = 404
    throw error
  }

  // Conta transações ativas vinculadas a esta categoria
  const transactionCount = await prisma.transaction.count({
    where: {
      categoryId: id,
      userId,
      deletedAt: null, // ignora transações já removidas
    },
  })

  if (transactionCount > 0) {
    const error = new Error(
      `Categoria possui ${transactionCount} lançamento(s) vinculado(s). Remova-os primeiro ou altere a categoria dos lançamentos.`
    ) as any
    error.code = "CATEGORY_IN_USE"
    error.statusCode = 409
    throw error
  }

  // Soft delete: preenche deletedAt em vez de deletar o registro
  return prisma.category.update({
    where: { id },
    data: { deletedAt: new Date() },
  })
}
