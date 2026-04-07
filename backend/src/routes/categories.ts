/**
 * src/routes/categories.ts
 *
 * Rotas de categorias: CRUD completo.
 *
 * Este arquivo SÓ cuida de HTTP:
 *   1. Parseia e valida o body com Zod
 *   2. Extrai userId do JWT (request.user.sub — nunca do body!)
 *   3. Chama o service correspondente
 *   4. Formata e envia a resposta
 *
 * A lógica de negócio fica em src/services/categories.ts.
 *
 * Rotas registradas:
 *   GET    /categories          → lista categorias com subcategorias
 *   POST   /categories          → cria categoria
 *   PUT    /categories/:id      → atualiza categoria
 *   DELETE /categories/:id      → remove (soft delete, bloqueia se tem transações)
 */

import type { FastifyInstance } from "fastify"
import { z } from "zod"
import { authenticate } from "../middleware/auth.js"
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../services/categories.js"

// ─── Schemas de validação ─────────────────────────────────────────────────────

const createCategorySchema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(50, "Nome deve ter no máximo 50 caracteres"),
  icon: z
    .string()
    .min(1, "Ícone é obrigatório")
    .max(10, "Ícone deve ter no máximo 10 caracteres"),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Cor deve ser um hex válido (ex: #5A8FE8)"),
  slug: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minúsculas, números e hífens")
    .optional(),
})

// PUT aceita qualquer subconjunto dos campos (Partial)
const updateCategorySchema = createCategorySchema.partial()

// ─── Registro de rotas ────────────────────────────────────────────────────────

export async function categoriesRoutes(fastify: FastifyInstance) {
  // Todas as rotas deste plugin exigem autenticação.
  // O preHandler é aplicado a cada rota individualmente para ser explícito,
  // mas poderíamos usar addHook("preHandler") no plugin para aplicar a todas.

  // ── GET /categories ──────────────────────────────────────────────────────
  fastify.get(
    "/categories",
    { preHandler: [authenticate] },
    async (request, reply) => {
      // userId vem do JWT — nunca do body ou query params (anti-IDOR)
      const categories = await listCategories(request.user.sub)
      return reply.send(categories)
    }
  )

  // ── POST /categories ─────────────────────────────────────────────────────
  fastify.post(
    "/categories",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const body = createCategorySchema.parse(request.body)
      const category = await createCategory(request.user.sub, body)
      // 201 Created: novo recurso foi criado com sucesso
      return reply.status(201).send(category)
    }
  )

  // ── PUT /categories/:id ──────────────────────────────────────────────────
  fastify.put(
    "/categories/:id",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string }
      const body = updateCategorySchema.parse(request.body)

      const category = await updateCategory(id, request.user.sub, body)
      return reply.send(category)
    }
  )

  // ── DELETE /categories/:id ───────────────────────────────────────────────
  fastify.delete(
    "/categories/:id",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const { id } = request.params as { id: string }
      await deleteCategory(id, request.user.sub)
      // 204 No Content: operação bem-sucedida, sem corpo de resposta
      return reply.status(204).send()
    }
  )
}
