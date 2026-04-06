/**
 * src/middleware/auth.ts
 *
 * Hook de autenticação para o Fastify.
 *
 * Este middleware é registrado em cada rota protegida com:
 *   { preHandler: [authenticate] }
 *
 * O que ele faz:
 *   1. Extrai o Bearer token do header Authorization
 *   2. Verifica a assinatura e expiração com verifyAccessToken()
 *   3. Popula request.user com os dados do payload
 *   4. Se qualquer passo falhar → retorna 401 Unauthorized
 *
 * O handler da rota pode então acessar request.user com segurança,
 * sabendo que o userId ali é legítimo e vem do JWT — nunca do body.
 */

import type { FastifyRequest, FastifyReply } from "fastify"
import { verifyAccessToken, type AccessTokenPayload } from "../lib/tokens.js"

// Extende o tipo FastifyRequest do Fastify para incluir o campo user.
// Sem isso, TypeScript reclamaria ao acessar request.user nas rotas.
declare module "fastify" {
  interface FastifyRequest {
    user: AccessTokenPayload
  }
}

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const authHeader = request.headers.authorization

  // Header deve ter o formato: "Bearer <token>"
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return reply.status(401).send({
      error: "UNAUTHORIZED",
      message: "Token de acesso ausente ou malformado.",
      statusCode: 401,
    })
  }

  const token = authHeader.slice(7) // remove "Bearer " do início

  try {
    // verifyAccessToken lança exceção se o token for inválido ou expirado
    const payload = verifyAccessToken(token)

    // Disponibiliza o payload em todas as rotas protegidas
    request.user = payload
  } catch {
    // Não expõe detalhes do erro (evita information leakage)
    return reply.status(401).send({
      error: "TOKEN_INVALID",
      message: "Token de acesso inválido ou expirado.",
      statusCode: 401,
    })
  }
}
