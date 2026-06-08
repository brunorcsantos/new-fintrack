/**
 * src/routes/subcategories.ts
 *
 * Rotas de categorias: CRUD completo.
 *
 * Este arquivo SÓ cuida de HTTP:
 *   1. Parseia e valida o body com Zod
 *   2. Extrai userId do JWT (request.user.sub — nunca do body!)
 *   3. Chama o service correspondente
 *   4. Formata e envia a resposta
 *
 * A lógica de negócio fica em src/services/subcategories.ts.
 *
 * Rotas registradas:
 *   GET    /subcategories          → lista subcategorias
 *   POST   /subcategories          → cria subcategoria
 *   PUT    /subcategories/:id      → atualiza subcategoria
 *   DELETE /subcategories/:id      → remove (soft delete, bloqueia se tem transações)
 */

import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { authenticate } from "../middleware/auth.js";
import {
  listSubcategories,
  createSubcategory,
  deleteSubcategory,
  updateSubcategory,
} from "../services/subcategories.js";

const createSubcategorySchema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(50, "Nome deve ter no máximo 50 caracteres"),
  icon: z
    .string()
    .min(1, "Ícone é obrigatório")
    .max(10, "Ícone deve ter no máximo 10 caracteres"),
});

// PUT aceita qualquer subconjunto dos campos (Partial)
const updateSubcategorySchema = createSubcategorySchema.partial();

// ─── Registro de rotas ────────────────────────────────────────────────────────
export async function subcategoriesRoutes(fastify: FastifyInstance) {
  // Todas as rotas deste plugin exigem autenticação.
  // O preHandler é aplicado a cada rota individualmente para ser explícito,
  // mas poderíamos usar addHook("preHandler") no plugin para aplicar a todas.

  // ── GET /subcategories/:categoryId ──────────────────────────────────────────────────────
  fastify.get(
    "/categories/:categoryId/subcategories",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const { categoryId } = request.params as { categoryId: string };
      const subcategories = await listSubcategories(categoryId);
      return reply.send(subcategories);
    },
  );

  // ── POST   /categories/:categoryId/subcategories
  fastify.post(
    "/categories/:categoryId/subcategories",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const { categoryId } = request.params as { categoryId: string };
      const body = createSubcategorySchema.parse(request.body);
      const subcategory = await createSubcategory(categoryId, body);
      return reply.code(201).send(subcategory);
    },
  );

  // ── PUT    /categories/:categoryId/subcategories/:id
  fastify.put(
    "/categories/:categoryId/subcategories/:id",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const { categoryId, id } = request.params as {
        categoryId: string;
        id: string;
      };

      const body = updateSubcategorySchema.parse(request.body);

      const subcategory = await updateSubcategory(id, categoryId, body);

      return reply.send(subcategory);
    },
  );

  // ── DELETE /categories/:categoryId/subcategories/:id
  fastify.delete(
    "/categories/:categoryId/subcategories/:id",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const { categoryId, id } = request.params as {
        categoryId: string;
        id: string;
      };

      await deleteSubcategory(id, categoryId, request.user.sub);
      return reply.status(204).send();
    },
  );
}
