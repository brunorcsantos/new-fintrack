/**
 * src/__tests__/rateLimiter.test.ts
 *
 * Testes unitários para a lógica de rate limiting.
 * Testa o comportamento da store in-memory isoladamente.
 */

import { describe, it, expect } from "vitest"

// Reimplementamos a lógica pura aqui para testar sem depender do Fastify
type RateLimitEntry = { count: number; resetAt: number }

function checkRateLimit(
  store: Map<string, RateLimitEntry>,
  key: string,
  max: number,
  windowMs: number
): { allowed: boolean; remaining: number; retryAfterMs: number } {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || entry.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: max - 1, retryAfterMs: 0 }
  }

  entry.count += 1

  if (entry.count > max) {
    const retryAfterMs = entry.resetAt - now
    return { allowed: false, remaining: 0, retryAfterMs }
  }

  return { allowed: true, remaining: max - entry.count, retryAfterMs: 0 }
}

describe("Rate Limiter Logic", () => {
  it("deve permitir requests até o limite", () => {
    const store = new Map<string, RateLimitEntry>()
    const max = 3
    const windowMs = 60_000

    const r1 = checkRateLimit(store, "ip:1", max, windowMs)
    expect(r1.allowed).toBe(true)
    expect(r1.remaining).toBe(2)

    const r2 = checkRateLimit(store, "ip:1", max, windowMs)
    expect(r2.allowed).toBe(true)
    expect(r2.remaining).toBe(1)

    const r3 = checkRateLimit(store, "ip:1", max, windowMs)
    expect(r3.allowed).toBe(true)
    expect(r3.remaining).toBe(0)
  })

  it("deve bloquear após exceder o limite", () => {
    const store = new Map<string, RateLimitEntry>()
    const max = 2
    const windowMs = 60_000

    checkRateLimit(store, "ip:2", max, windowMs)
    checkRateLimit(store, "ip:2", max, windowMs)

    const r3 = checkRateLimit(store, "ip:2", max, windowMs)
    expect(r3.allowed).toBe(false)
    expect(r3.remaining).toBe(0)
    expect(r3.retryAfterMs).toBeGreaterThan(0)
  })

  it("deve isolar IPs diferentes", () => {
    const store = new Map<string, RateLimitEntry>()
    const max = 1
    const windowMs = 60_000

    checkRateLimit(store, "ip:A", max, windowMs)
    const blocked = checkRateLimit(store, "ip:A", max, windowMs)
    expect(blocked.allowed).toBe(false)

    // IP diferente não deve ser afetado
    const fresh = checkRateLimit(store, "ip:B", max, windowMs)
    expect(fresh.allowed).toBe(true)
  })

  it("deve resetar após a janela expirar", () => {
    const store = new Map<string, RateLimitEntry>()
    const max = 1
    const windowMs = 100 // 100ms para o teste

    checkRateLimit(store, "ip:3", max, windowMs)
    const blocked = checkRateLimit(store, "ip:3", max, windowMs)
    expect(blocked.allowed).toBe(false)

    // Simula expiração da janela
    const entry = store.get("ip:3")!
    entry.resetAt = Date.now() - 1 // força expiração

    const afterReset = checkRateLimit(store, "ip:3", max, windowMs)
    expect(afterReset.allowed).toBe(true)
  })
})
