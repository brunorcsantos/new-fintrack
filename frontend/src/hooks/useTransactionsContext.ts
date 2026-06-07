import { useContext } from "react"
import { UseTransactionsReturn } from "./useTransactions"
import { TransactionsContext } from "@/context/TransactionsContext"

export function useTransactionsContext(): UseTransactionsReturn {
  const ctx = useContext(TransactionsContext)
  if (!ctx) throw new Error("useTransactionsContext deve ser usado dentro de <TransactionsProvider>")
  return ctx
}