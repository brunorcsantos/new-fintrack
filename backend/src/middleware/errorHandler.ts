/**
 * src/middleware/errorHandler.ts
 *
 * Handler global de erros do Fastify.
 *
 * Registrado uma vez no server.ts com:
 *   fastify.setErrorHandler(errorHandler)
 *
 * Centraliza o tratamento de erros em um único lugar, garantindo que:
 * - Toda resposta de erro segue o mesmo contrato JSON
 * - Stack traces NUNCA são expostos em produção
 * - Erros do Prisma são mapeados para HTTP status codes semânticos
 * - Erros de validação Zod retornam 400 com detalhes dos campos
 */

import type { FastifyError, FastifyRequest, FastifyReply } from "fastify"
import { ZodError } from "zod"
import { Prisma } from "@prisma/client"
import { env } from "../lib/env.js"

export async function errorHandler(
  error: FastifyError | Error,
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  // ── Erros de validação do Fastify (JSON Schema nativo) ──────────────────
  if ("statusCode" in error && error.statusCode === 400) {
    return reply.status(400).send({
      error: "VALIDATION_ERROR",
      message: "Dados inválidos na requisição.",
      statusCode: 400,
      details: error.message,
    })
  }

  // ── Erros de validação Zod ───────────────────────────────────────────────
  if (error instanceof ZodError) {
    return reply.status(400).send({
      error: "VALIDATION_ERROR",
      message: "Dados inválidos na requisição.",
      statusCode: 400,
      // Mapeia os erros Zod para um formato de fácil leitura pelo frontend
      fields: error.flatten().fieldErrors,
    })
  }

  // ── Erros do Prisma ──────────────────────────────────────────────────────
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // P2002: Unique constraint — tentativa de inserir valor duplicado
    if (error.code === "P2002") {
      const field = (error.meta?.target as string[])?.join(", ")
      return reply.status(409).send({
        error: "CONFLICT",
        message: `Já existe um registro com este ${field}.`,
        statusCode: 409,
      })
    }

    // P2025: Record not found — registro não existe ou foi deletado
    if (error.code === "P2025") {
      return reply.status(404).send({
        error: "NOT_FOUND",
        message: "Registro não encontrado.",
        statusCode: 404,
      })
    }

    // P2003: Foreign key constraint — referência a registro inexistente
    if (error.code === "P2003") {
      return reply.status(400).send({
        error: "INVALID_REFERENCE",
        message: "Referência a um recurso inexistente.",
        statusCode: 400,
      })
    }
  }

  // ── Erro interno inesperado ──────────────────────────────────────────────
  // Loga o erro completo (com stack) no servidor para diagnóstico
  request.log.error({
    err: error,
    request: {
      method: request.method,
      url: request.url,
      userId: (request as any).user?.sub,
    },
  })

  // Em produção: nunca expõe detalhes internos
  // Em desenvolvimento: inclui a mensagem para facilitar debugging
  return reply.status(500).send({
    error: "INTERNAL_SERVER_ERROR",
    message:
      env.NODE_ENV === "development"
        ? error.message
        : "Ocorreu um erro interno. Tente novamente.",
    statusCode: 500,
  })
}
