/**
 * src/__tests__/dateUtils.test.ts
 *
 * Testes unitários para src/lib/dateUtils.ts.
 * Cobre: currentMonth e monthToDateRange.
 */

import { describe, it, expect } from "vitest"
import { currentMonth, monthToDateRange } from "../lib/dateUtils.js"

describe("currentMonth", () => {
  it("deve retornar formato YYYY-MM", () => {
    const result = currentMonth()
    expect(result).toMatch(/^\d{4}-\d{2}$/)
  })
})

describe("monthToDateRange", () => {
  it("deve converter 2026-03 para range de março", () => {
    const range = monthToDateRange("2026-03")

    expect(range.gte.toISOString()).toBe("2026-03-01T00:00:00.000Z")
    expect(range.lt.toISOString()).toBe("2026-04-01T00:00:00.000Z")
  })

  it("deve tratar virada de ano corretamente", () => {
    const range = monthToDateRange("2025-12")

    expect(range.gte.toISOString()).toBe("2025-12-01T00:00:00.000Z")
    expect(range.lt.toISOString()).toBe("2026-01-01T00:00:00.000Z")
  })

  it("deve tratar janeiro corretamente", () => {
    const range = monthToDateRange("2026-01")

    expect(range.gte.toISOString()).toBe("2026-01-01T00:00:00.000Z")
    expect(range.lt.toISOString()).toBe("2026-02-01T00:00:00.000Z")
  })
})
