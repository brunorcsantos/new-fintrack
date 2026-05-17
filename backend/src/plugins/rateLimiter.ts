/**
 * src/plugins/rateLimiter.ts
 *
 * Rate limiting em duas camadas:
 *
 * 1. ROTAS DE AUTH (/auth/login, /auth/refresh):
 *    10 req / 15 min por IP — anti-brute force.
 *    Aplicado desde a Fase 1 conforme o plano.
 *
 * 2. ROTAS GERAIS (todo o resto):
 *    100 req / 60s por IP — proteção contra abuso.
 *    Configurável via RATE_LIMIT_MAX e RATE_LIMIT_WINDOW_MS.
 *
 * Implementação: in-memory Map com cleanup automático.
 * Suficiente para single instance no Railway.
 * Se escalar para múltiplas instâncias: migrar para Redis.
 *
 * Resposta 429 inclui header Retry-After com o tempo em segundos
 * até que o usuário possa tentar novamente.
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from "fastify"
import fp from "fastify-plugin"
import { env } from "../lib/env.js"

// ─── Tipos ────────────────────────────────────────────────────────────────────

type RateLimitEntry = {
  count: number
  resetAt: number // timestamp em ms
}

// ─── Store in-memory ──────────────────────────────────────────────────────────

const store = new Map<string, RateLimitEntry>()

// Cleanup periódico: remove entradas expiradas a cada 60s
// Evita memory leak em caso de muitos IPs diferentes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (entry.resetAt <= now) {
      store.delete(key)
    }
  }
}, 60_000)

// ─── Helper ───────────────────────────────────────────────────────────────────

function getClientIp(request: FastifyRequest): string {
  // Fastify com @fastify/proxy-addr já resolve X-Forwarded-For
  return request.ip
}

function checkRateLimit(
  key: string,
  max: number,
  windowMs: number
): { allowed: boolean; remaining: number; retryAfterMs: number } {
  const now = Date.now()
  const entry = store.get(key)

  // Primeira request ou janela expirada
  if (!entry || entry.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: max - 1, retryAfterMs: 0 }
  }

  // Dentro da janela — incrementa
  entry.count += 1

  if (entry.count > max) {
    const retryAfterMs = entry.resetAt - now
    return { allowed: false, remaining: 0, retryAfterMs }
  }

  return { allowed: true, remaining: max - entry.count, retryAfterMs: 0 }
}

// ─── Plugin ───────────────────────────────────────────────────────────────────

async function rateLimiterPlugin(fastify: FastifyInstance) {
  // Rotas de auth com rate limit estrito
  const AUTH_PATHS = ["/auth/login", "/auth/refresh", "/auth/register"]

  fastify.addHook("onRequest", async (request: FastifyRequest, reply: FastifyReply) => {
    const ip = getClientIp(request)
    const path = request.url.split("?")[0] // remove query string

    const isAuthRoute = AUTH_PATHS.some((p) => path === p)

    const max = isAuthRoute ? env.AUTH_RATE_LIMIT_MAX : env.RATE_LIMIT_MAX
    const windowMs = isAuthRoute ? env.AUTH_RATE_LIMIT_WINDOW_MS : env.RATE_LIMIT_WINDOW_MS

    // Chave distinta para auth vs geral — evita que requests normais consumam o budget de auth
    const prefix = isAuthRoute ? "auth" : "general"
    const key = `${prefix}:${ip}`

    const { allowed, remaining, retryAfterMs } = checkRateLimit(key, max, windowMs)

    // Headers informativos (sempre presentes)
    reply.header("X-RateLimit-Limit", max)
    reply.header("X-RateLimit-Remaining", Math.max(0, remaining))

    if (!allowed) {
      const retryAfterSeconds = Math.ceil(retryAfterMs / 1000)
      reply.header("Retry-After", retryAfterSeconds)

      return reply.status(429).send({
        error: "RATE_LIMIT_EXCEEDED",
        message: `Muitas requisições. Tente novamente em ${retryAfterSeconds} segundos.`,
        statusCode: 429,
      })
    }
  })
}

export default fp(rateLimiterPlugin, {
  name: "rate-limiter",
})
