/**
 * src/hooks/useDashboard.ts
 *
 * Busca os dados do dashboard em 3 requests paralelas:
 *   1. /transactions/summary  → totais do mês + breakdown por categoria
 *   2. /transactions          → últimas 6 transações (para a lista recente)
 *
 * O mês usado é sempre o mês atual (currentMonth()).
 * O hook expõe `refetch` para que o dashboard possa recarregar
 * após criar/deletar uma transação (invalidação do cache local).
 */

import { useState, useEffect, useCallback } from "react"
import { api } from "@/lib/api"
import { currentMonth, toNumber } from "@/lib/utils"
import type { Transaction, TransactionSummary } from "@/types"

export type DashboardSummary = {
  income: number
  expenses: number
  balance: number
  savingsRate: number
}

export type DashboardChartItem = {
  name: string
  value: number
  color: string
  
}

export type UseDashboardReturn = {
  summary: DashboardSummary | null
  chartData: DashboardChartItem[]
  recentTransactions: Transaction[]
  month: string
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export function useDashboard(): UseDashboardReturn {
  const month = currentMonth()

  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [chartData, setChartData] = useState<DashboardChartItem[]>([])
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)

  const refetch = useCallback(() => setTick((t) => t + 1), [])

  useEffect(() => {
    let cancelled = false

    async function fetchAll() {
      setIsLoading(true)
      setError(null)

      try {
        // 3 requests paralelas — minimiza latência total
        const [summaryRaw, transactionsRaw] = await Promise.all([
          api.get<TransactionSummary>(`/transactions/summary?month=${month}`),
          api.get<{ data: Transaction[] }>(`/transactions?month=${month}&limit=6&page=1`),
        ])

        if (cancelled) return

        const income = toNumber(summaryRaw.totalIncome)
        const expenses = toNumber(summaryRaw.totalExpense)
        const balance = toNumber(summaryRaw.balance)
        const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0

        setSummary({ income, expenses, balance, savingsRate })

        // Converte byCategory para o formato do PieChart
        const chart: DashboardChartItem[] = summaryRaw.byCategory
          .filter((c) => {
            const value = toNumber(c.totalExpense)
            return value > 0
          })
          .map((c) => ({
            name: c.categoryName,
            value: toNumber(c.totalExpense),
            color: c.categoryColor,
          }))
        setChartData(chart)

        setRecentTransactions(transactionsRaw.data ?? [])
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message ?? "Erro ao carregar dashboard.")
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchAll()

    return () => {
      cancelled = true
    }
  }, [month, tick])

  return {
    summary,
    chartData,
    recentTransactions,
    month,
    isLoading,
    error,
    refetch,
  }
}