/**
 * src/__tests__/tokens.test.ts
 *
 * Testes unitários para src/lib/tokens.ts.
 * Cobre: criação, verificação e expiração de access e refresh tokens.
 */

import { describe, it, expect } from "vitest"
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  refreshTokenExpiresAt,
} from "../lib/tokens.js"

describe("Access Token", () => {
  const payload = { sub: "user-123", email: "test@test.com", name: "Test User" }

  it("deve criar e verificar um access token válido", () => {
    const token = signAccessToken(payload)
    const decoded = verifyAccessToken(token)

    expect(decoded.sub).toBe(payload.sub)
    expect(decoded.email).toBe(payload.email)
    expect(decoded.name).toBe(payload.name)
  })

  it("deve lançar erro para token inválido", () => {
    expect(() => verifyAccessToken("token-invalido")).toThrow()
  })

  it("deve lançar erro para token com secret errado", () => {
    // Um token assinado com outro secret não deve ser aceito
    const token = signAccessToken(payload)
    const tampered = token.slice(0, -5) + "xxxxx"
    expect(() => verifyAccessToken(tampered)).toThrow()
  })
})

describe("Refresh Token", () => {
  const payload = { sub: "user-123", jti: "token-id-456" }

  it("deve criar e verificar um refresh token válido", () => {
    const token = signRefreshToken(payload)
    const decoded = verifyRefreshToken(token)

    expect(decoded.sub).toBe(payload.sub)
    expect(decoded.jti).toBe(payload.jti)
  })

  it("deve lançar erro para token inválido", () => {
    expect(() => verifyRefreshToken("token-invalido")).toThrow()
  })

  it("não deve aceitar um access token como refresh token", () => {
    // Access e refresh usam secrets diferentes — cross-use deve falhar
    const accessToken = signAccessToken({ sub: "user-123", email: "a@b.com", name: "A" })
    expect(() => verifyRefreshToken(accessToken)).toThrow()
  })
})

describe("refreshTokenExpiresAt", () => {
  it("deve retornar uma data ~30 dias no futuro", () => {
    const now = Date.now()
    const expiresAt = refreshTokenExpiresAt()
    const diffDays = (expiresAt.getTime() - now) / (1000 * 60 * 60 * 24)

    expect(diffDays).toBeGreaterThan(29)
    expect(diffDays).toBeLessThan(31)
  })
})
