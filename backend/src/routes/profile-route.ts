/**
 * src/routes/profile.ts
 *
 * Rotas de perfil do usuário autenticado.
 *
 * Rotas registradas:
 *   PUT /profile          → atualiza nome e/ou email
 *   PUT /profile/password → altera senha (exige senha atual)
 */

import type { FastifyInstance } from "fastify"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { authenticate } from "../middleware/auth.js"
import { prisma } from "../lib/prisma.js"

// ─── Schemas ──────────────────────────────────────────────────────────────────

const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100)
    .optional(),
  email: z
    .string()
    .email("E-mail inválido")
    .optional(),
}).refine((d) => d.name !== undefined || d.email !== undefined, {
  message: "Informe ao menos um campo para atualizar.",
})

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Senha atual é obrigatória"),
  newPassword: z
    .string()
    .min(8, "Nova senha deve ter pelo menos 8 caracteres")
    .max(128),
})

// ─── Rotas ────────────────────────────────────────────────────────────────────

export async function profileRoutes(fastify: FastifyInstance) {

  // ── PUT /profile ─────────────────────────────────────────────────────────
  fastify.put(
    "/profile",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const userId = request.user.sub
      const body = updateProfileSchema.parse(request.body)

      // Se mudou o email, verifica se já está em uso por outro usuário
      if (body.email) {
        const conflict = await prisma.user.findFirst({
          where: { email: body.email, NOT: { id: userId } },
          select: { id: true },
        })
        if (conflict) {
          return reply.status(409).send({
            error: "EMAIL_ALREADY_EXISTS",
            message: "Este e-mail já está em uso.",
            statusCode: 409,
          })
        }
      }

      const updated = await prisma.user.update({
        where: { id: userId },
        data: {
          ...(body.name  !== undefined && { name: body.name }),
          ...(body.email !== undefined && { email: body.email }),
        },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
      })

      return reply.send(updated)
    }
  )

  // ── PUT /profile/password ─────────────────────────────────────────────────
  fastify.put(
    "/profile/password",
    { preHandler: [authenticate] },
    async (request, reply) => {
      const userId = request.user.sub
      const body = updatePasswordSchema.parse(request.body)

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { passwordHash: true },
      })

      // Usuários OAuth puro não têm senha local
      if (!user?.passwordHash) {
        return reply.status(400).send({
          error: "NO_PASSWORD",
          message: "Sua conta não possui senha local. Use o login social.",
          statusCode: 400,
        })
      }

      const isValid = await bcrypt.compare(body.currentPassword, user.passwordHash)
      if (!isValid) {
        return reply.status(401).send({
          error: "INVALID_CURRENT_PASSWORD",
          message: "Senha atual incorreta.",
          statusCode: 401,
        })
      }

      if (body.currentPassword === body.newPassword) {
        return reply.status(400).send({
          error: "SAME_PASSWORD",
          message: "A nova senha deve ser diferente da atual.",
          statusCode: 400,
        })
      }

      const passwordHash = await bcrypt.hash(body.newPassword, 12)

      await prisma.user.update({
        where: { id: userId },
        data: { passwordHash },
      })

      return reply.status(204).send()
    }
  )
}
