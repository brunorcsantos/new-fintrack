/**
 * src/routes/transactions.ts
 *
 * Rotas de transações: CRUD + summary.
 *
 * IDEMPOTENCY-KEY:
 *   O header `Idempotency-Key` é extraído em POST /transactions.
 *   O frontend gera um UUID v4 antes de submeter o formulário
 *   (em generateIdempotencyKey() em utils.ts) e o envia neste header.
 *   Isso protege contra: duplo clique, retry de rede, re-submit por reload.
 *
 * Rotas registradas:
 *   GET    /transactions           → lista com filtros e paginação
 *   GET    /transactions/summary   → aggregação para o dashboard
 *   POST   /transactions           → cria [suporta Idempotency-Key]
 *   PUT    /transactions/:id       → atualiza
 *   DELETE /transactions/:id       → remove (soft delete)
 */

import type { FastifyInstance } from "fastify"
import { z } from "zod"
import { authenticate } from "../middleware/auth.js"
import {
  listTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionSummary,
} from "../services/transactions.js"
import { currentMonth } from "../lib/dateUtils.js"

// ─── Schemas de validação ─────────────────────────────────────────────────────

const createTransactionSchema = z.object({
  description: z
    .string()
    .min(2, "Descrição deve ter pelo menos 2 caracteres")
    .max(200, "Descrição deve ter no máximo 200 caracteres"),
  amount: z
    .number()
    .positive("Valor deve ser positivo")
    .max(9_999_999_999.99, "Valor excede o limite suportado"),
  type: z.enum(["income", "expense"], {
    errorMap: () => ({ message: 'Tipo deve ser "income" ou "expense"' }),
  }),
  date: z.string().datetime({ message: "Data deve ser uma string ISO 8601 válida" }),
  notes: z.string().max(500, "Notas devem ter no máximo 500 caracteres").optional(),
  categoryId: z.string().uuid("categoryId deve ser um UUID válido"),
  subcategoryId: z.string().uuid("subcategoryId deve ser um UUID válido").optional(),
})

const updateTransactionSchema = createTransactionSchema.partial()

const listQuerySchema = z.object({
  month: z
    .string()
    .regex(/^\d{4}-\d{2}$/, 'month deve estar no formato "YYYY-MM"')
    .optional(),
  type: z.enum(["income", "expense"]).optional(),
  categoryId: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
})

const summaryQuerySchema = z.object({
  month: z
    .string()
    .regex(/^\d{4}-\d{2}$/, 'month deve estar no formato "YYYY-MM"')
    .optional(),
})

// ─── Registro de rotas ────────────────────────────────────────────────────────

export async function transactionsRoutes(fastify: FastifyInstance) {

  // ── GET /transactions/summary ────────────────────────────────────────────
  // IMPORTANTE: esta rota deve ser registrada ANTES de GET /transactions/:id
  // (se existisse) para o Fastify não interpretar "summary" como um param :id.
  fastify.get(
    "/transactions/summary",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const query = summaryQuerySchema.parse(request.query)
      // Usa o mês atual como padrão se não for especificado
      const month = query.month ?? currentMonth()
      const summary = await getTransactionSummary(request.user.sub, month)
      return reply.send(summary)
    }
  )

  // ── GET /transactions ────────────────────────────────────────────────────
  fastify.get(
    "/transactions",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const query = listQuerySchema.parse(request.query)
      const result = await listTransactions(request.user.sub, query)
      return reply.send(result)
    }
  )

  // ── POST /transactions ───────────────────────────────────────────────────
  fastify.post(
    "/transactions",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const body = createTransactionSchema.parse(request.body)

      // Extrai a Idempotency-Key do header (se enviada pelo frontend)
      // O frontend usa generateIdempotencyKey() de utils.ts
      const idempotencyKey = request.headers["idempotency-key"] as string | undefined

      const transaction = await createTransaction(request.user.sub, {
        ...body,
        idempotencyKey,
      })

      // 201 Created para nova transação
      // Se a key já existia, ainda retornamos 201 (idempotente: mesmo resultado)
      return reply.status(201).send(transaction)
    }
  )

  // ── PUT /transactions/:id ────────────────────────────────────────────────
  fastify.put(
    "/transactions/:id",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string }
      const body = updateTransactionSchema.parse(request.body)
      const transaction = await updateTransaction(id, request.user.sub, body)
      return reply.send(transaction)
    }
  )

  // ── DELETE /transactions/:id ─────────────────────────────────────────────
  fastify.delete(
    "/transactions/:id",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string }
      await deleteTransaction(id, request.user.sub)
      return reply.status(204).send()
    }
  )
}
