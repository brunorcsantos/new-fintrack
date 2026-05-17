/**
 * src/__tests__/seed.test.ts
 *
 * Testes unitários para prisma/seed.ts.
 * Valida que buildSeedOperations retorna o número correto de operações
 * e que as categorias padrão estão bem definidas.
 */

import { describe, it, expect } from "vitest"
import { DEFAULT_CATEGORIES, buildSeedOperations } from "../../prisma/seed.js"

describe("DEFAULT_CATEGORIES", () => {
  it("deve ter exatamente 7 categorias padrão", () => {
    expect(DEFAULT_CATEGORIES).toHaveLength(7)
  })

  it("todas as categorias devem ter slug, name, icon e color", () => {
    for (const cat of DEFAULT_CATEGORIES) {
      expect(cat.slug).toBeTruthy()
      expect(cat.name).toBeTruthy()
      expect(cat.icon).toBeTruthy()
      expect(cat.color).toMatch(/^#[0-9A-Fa-f]{6}$/)
    }
  })

  it("todas as categorias devem ter pelo menos 2 subcategorias", () => {
    for (const cat of DEFAULT_CATEGORIES) {
      expect(cat.subcategories.length).toBeGreaterThanOrEqual(2)
    }
  })

  it("subcategorias devem ter slug, name e icon", () => {
    for (const cat of DEFAULT_CATEGORIES) {
      for (const sub of cat.subcategories) {
        expect(sub.slug).toBeTruthy()
        expect(sub.name).toBeTruthy()
        expect(sub.icon).toBeTruthy()
      }
    }
  })

  it("slugs de categorias devem ser únicos", () => {
    const slugs = DEFAULT_CATEGORIES.map((c) => c.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })
})

describe("buildSeedOperations", () => {
  it("deve retornar 7 operações (uma por categoria)", () => {
    // Mock mínimo do PrismaClient — buildSeedOperations chama prisma.category.create
    const mockPrisma = {
      category: {
        create: (args: unknown) => args, // retorna os argumentos como-são
      },
    } as any

    const ops = buildSeedOperations(mockPrisma, "test-user-id")
    expect(ops).toHaveLength(7)
  })
})
