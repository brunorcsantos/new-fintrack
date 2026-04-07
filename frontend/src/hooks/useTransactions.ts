/**
 * src/hooks/useTransactions.ts
 *
 * Hook de domínio para transações.
 *
 * DECISÃO DE DESIGN (do plano):
 * "Instanciados UMA vez no AuthenticatedApp e passados via props.
 *  Evita dupla chamada de API por navegação."
 *
 * Isso significa: NÃO use este hook dentro de componentes de lista
 * ou de formulário. Ele fica no nível do layout autenticado e os
 * dados descem via props. Isso garante que navegar entre páginas
 * não dispara novos fetches desnecessários.
 *
 * OPTIMISTIC UPDATE (create/delete):
 * O plano define: "Aplicar APENAS em create/delete de transações."
 * Implementamos aqui: ao criar, adicionamos otimisticamente na lista
 * e revertemos se o servidor retornar erro.
 */

import { useState, useCallback } from "react"
import { api } from "@/lib/api"
import { currentMonth } from "@/lib/utils"
import type { Transaction, TransactionSummary, PaginatedResponse } from "@/types"

export type TransactionFilters = {
  month?: string
  type?: "income" | "expense"
  categoryId?: string
  page?: number
  limit?: number
}

export type UseTransactionsReturn = {
  // Estado
  transactions: Transaction[]
  summary: TransactionSummary | null
  total: number
  totalPages: number
  currentPage: number
  isLoading: boolean
  isLoadingSummary: boolean
  error: string | null
  filters: TransactionFilters

  // Ações
  setFilters: (filters: TransactionFilters) => void
  fetchTransactions: (filters?: TransactionFilters) => Promise<void>
  fetchSummary: (month?: string) => Promise<void>
  createTransaction: (
    data: Omit<Transaction, "id" | "userId" | "category" | "subcategory"> & {
      idempotencyKey?: string
    }
  ) => Promise<Transaction>
  updateTransaction: (
    id: string,
    data: Partial<Omit<Transaction, "id" | "userId" | "category" | "subcategory">>
  ) => Promise<Transaction>
  deleteTransaction: (id: string) => Promise<void>
}

export function useTransactions(): UseTransactionsReturn {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [summary, setSummary] = useState<TransactionSummary | null>(null)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingSummary, setIsLoadingSummary] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFiltersState] = useState<TransactionFilters>({
    month: currentMonth(),
    page: 1,
    limit: 10,
  })

  /**
   * Busca transações com filtros opcionais.
   * Se não fornecer filtros, usa o estado atual de `filters`.
   */
  const fetchTransactions = useCallback(async (overrideFilters?: TransactionFilters) => {
    setIsLoading(true)
    setError(null)
    try {
      const activeFilters = overrideFilters ?? filters

      // Monta a query string a partir dos filtros ativos
      const params = new URLSearchParams()
      if (activeFilters.month) params.set("month", activeFilters.month)
      if (activeFilters.type) params.set("type", activeFilters.type)
      if (activeFilters.categoryId) params.set("categoryId", activeFilters.categoryId)
      if (activeFilters.page) params.set("page", String(activeFilters.page))
      if (activeFilters.limit) params.set("limit", String(activeFilters.limit))

      const result = await api.get<PaginatedResponse<Transaction>>(
        `/transactions?${params.toString()}`
      )

      setTransactions(result.data)
      setTotal(result.total)
      setTotalPages(result.totalPages)
      setCurrentPage(result.page)
    } catch (err: any) {
      setError(err.message ?? "Erro ao carregar transações.")
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  /**
   * Busca o resumo financeiro do mês.
   * Usado pelo dashboard para cards de saldo e gráfico de pizza.
   */
  const fetchSummary = useCallback(async (month?: string) => {
    setIsLoadingSummary(true)
    try {
      const targetMonth = month ?? filters.month ?? currentMonth()
      const result = await api.get<TransactionSummary>(
        `/transactions/summary?month=${targetMonth}`
      )
      setSummary(result)
    } catch (err: any) {
      setError(err.message ?? "Erro ao carregar resumo.")
    } finally {
      setIsLoadingSummary(false)
    }
  }, [filters.month])

  /**
   * Cria uma transação com optimistic update.
   *
   * FLUXO:
   * 1. Monta um objeto temporário com id fake para exibir imediatamente
   * 2. Adiciona no topo da lista (optimistic)
   * 3. Faz a chamada ao servidor
   * 4a. Sucesso: substitui o objeto fake pelo real (com ID correto)
   * 4b. Erro: remove o objeto fake e lança o erro para o componente tratar
   *
   * Por que só em create/delete? O plano define:
   * "Não misturar abordagens — inconsistência é pior que latência extra."
   * Updates são menos frequentes e mais complexos para reverter otimisticamente.
   */
  const createTransaction = useCallback(async (
    data: Omit<Transaction, "id" | "userId" | "category" | "subcategory"> & {
      idempotencyKey?: string
    }
  ): Promise<Transaction> => {
    // ID temporário para o optimistic update
    const tempId = `temp-${Date.now()}`

    // Objeto optimista: exibimos antes do servidor confirmar
    const optimisticTransaction: Transaction = {
      ...data,
      id: tempId,
      userId: "", // será preenchido pelo servidor
      category: { id: data.categoryId, name: "", icon: "⏳", color: "#ccc" },
      subcategory: null,
    }

    // Adiciona otimisticamente no topo da lista
    setTransactions((prev) => [optimisticTransaction, ...prev])

    try {
      const headers: Record<string, string> = {}
      if (data.idempotencyKey) {
        headers["Idempotency-Key"] = data.idempotencyKey
      }

      const created = await api.post<Transaction>("/transactions", data, headers)

      // Substitui o objeto temporário pelo real retornado pelo servidor
      setTransactions((prev) =>
        prev.map((tx) => (tx.id === tempId ? created : tx))
      )

      // Também atualiza o total
      setTotal((prev) => prev + 1)

      return created
    } catch (err) {
      // Reverte: remove o objeto temporário
      setTransactions((prev) => prev.filter((tx) => tx.id !== tempId))
      throw err
    }
  }, [])

  /**
   * Atualiza uma transação (sem optimistic update — ver comentário em create).
   */
  const updateTransaction = useCallback(async (
    id: string,
    data: Partial<Omit<Transaction, "id" | "userId" | "category" | "subcategory">>
  ): Promise<Transaction> => {
    const updated = await api.put<Transaction>(`/transactions/${id}`, data)
    // Refetch em vez de optimistic: garante consistência com o servidor
    setTransactions((prev) =>
      prev.map((tx) => (tx.id === id ? updated : tx))
    )
    return updated
  }, [])

  /**
   * Remove uma transação com optimistic update.
   *
   * Remove imediatamente da lista. Se o servidor falhar, reinsere.
   * Note que isso é simples porque delete é irreversível do ponto de
   * vista do usuário — ele já viu sumir, o mais importante é a velocidade.
   */
  const deleteTransaction = useCallback(async (id: string): Promise<void> => {
    // Guarda para reverter em caso de erro
    const backup = transactions.find((tx) => tx.id === id)

    // Remove otimisticamente
    setTransactions((prev) => prev.filter((tx) => tx.id !== id))
    setTotal((prev) => Math.max(0, prev - 1))

    try {
      await api.delete(`/transactions/${id}`)
    } catch (err) {
      // Reverte: reinsere a transação removida
      if (backup) {
        setTransactions((prev) => [backup, ...prev])
        setTotal((prev) => prev + 1)
      }
      throw err
    }
  }, [transactions])

  const setFilters = useCallback((newFilters: TransactionFilters) => {
    setFiltersState(newFilters)
  }, [])

  return {
    transactions,
    summary,
    total,
    totalPages,
    currentPage,
    isLoading,
    isLoadingSummary,
    error,
    filters,
    setFilters,
    fetchTransactions,
    fetchSummary,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  }
}
