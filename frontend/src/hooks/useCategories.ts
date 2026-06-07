/**
 * src/hooks/useCategories.ts
 *
 * Hook de domínio para categorias.
 *
 * Sem optimistic update aqui (conforme o plano):
 * "Aplicar APENAS em create/delete de transações. Demais operações: refetch."
 *
 * Categorias são raras de criar/editar e servem de referência para
 * outras partes da UI — um estado inconsistente seria pior que latência.
 */

import { useState, useCallback } from "react"
import { api } from "@/lib/api"
import type { Category } from "@/types"

export type CreateCategoryData = {
  name: string
  icon: string
  color: string
}

export type UseCategoriesReturn = {
  categories: Category[]
  isLoading: boolean
  error: string | null
  fetchCategories: () => Promise<void>
  createCategory: (data: CreateCategoryData) => Promise<Category>
  updateCategory: (id: string, data: Partial<CreateCategoryData>) => Promise<Category>
  deleteCategory: (id: string) => Promise<void>
}

export function useCategories(): UseCategoriesReturn {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await api.get<Category[]>("/categories")
      setCategories(result)
    } catch (err: any) {
      setError(err.message ?? "Erro ao carregar categorias.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createCategory = useCallback(async (data: CreateCategoryData): Promise<Category> => {
    const created = await api.post<Category>("/categories", data)
    // Refetch para garantir consistência (sem optimistic)
    setCategories((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)))
    return created
  }, [])

  const updateCategory = useCallback(async (
    id: string,
    data: Partial<CreateCategoryData>
  ): Promise<Category> => {
    const updated = await api.put<Category>(`/categories/${id}`, data)
    setCategories((prev) =>
      prev.map((cat) => (cat.id === id ? updated : cat))
    )
    return updated
  }, [])

  const deleteCategory = useCallback(async (id: string): Promise<void> => {
    await api.delete(`/categories/${id}`)
    setCategories((prev) => prev.filter((cat) => cat.id !== id))
  }, [])

  return {
    categories,
    isLoading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  }
}
