/**
 * src/lib/tokens.ts
 *
 * Utilitários para criação e verificação de tokens JWT.
 *
 * O sistema usa dois tokens com propósitos distintos:
 *
 * ACCESS TOKEN (15 minutos)
 *   - Enviado no header Authorization: Bearer <token>
 *   - Verificado em toda request autenticada
 *   - Curto prazo: se vazar, expira rápido
 *   - NÃO é persistido no banco
 *
 * REFRESH TOKEN (30 dias)
 *   - Enviado apenas para POST /auth/refresh
 *   - Persistido no banco (tabela RefreshToken)
 *   - Permite renovar o access token sem novo login
 *   - Rotacionado: ao usar, o anterior é invalidado
 *   - Se detectarmos reuse (token já usado), revogamos a família toda
 */

import jwt from "jsonwebtoken"
import { env } from "./env.js"

// Payload do access token — o que fica "dentro" do token
export type AccessTokenPayload = {
  sub: string  // userId (sub = "subject" — convenção JWT)
  email: string
  name: string
}

// Payload do refresh token — mínimo necessário
export type RefreshTokenPayload = {
  sub: string  // userId
  jti: string  // JWT ID — identifica unicamente este token no banco
}

/**
 * Cria um access token JWT.
 * Expira em 15 minutos.
 */
export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: "15m",
    algorithm: "HS256",
  })
}

/**
 * Cria um refresh token JWT.
 * Expira em 30 dias.
 * O `jti` (JWT ID) é o UUID do registro na tabela RefreshToken.
 */
export function signRefreshToken(payload: RefreshTokenPayload): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: "30d",
    algorithm: "HS256",
  })
}

/**
 * Verifica e decodifica um access token.
 * Lança erro se o token for inválido ou expirado.
 */
export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_SECRET) as AccessTokenPayload
}

/**
 * Verifica e decodifica um refresh token.
 * Lança erro se o token for inválido ou expirado.
 */
export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload
}

/**
 * Calcula a data de expiração do refresh token (agora + 30 dias).
 * Usada para preencher o campo `expiresAt` na tabela RefreshToken.
 */
export function refreshTokenExpiresAt(): Date {
  const date = new Date()
  date.setDate(date.getDate() + 30)
  return date
}
