/**
 * src/views/Transactions.tsx
 *
 * Página de transações conectada à API real.
 *
 * Usa useTransactions para buscar, criar, editar e deletar transações.
 * Usa useCategories para popular o select de categorias no formulário.
 * Implementa filtros por mês e tipo conforme o plano.
 */


import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { TransactionsList } from "@/components/transactions/transactions-list"
import { TransactionsFilters } from "@/components/transactions/transactions-filters"
import { TransactionForm } from "@/components/transactions/transaction-form"
import { useTransactionsContext } from "@/hooks/useTransactionsContext"

export default function TransactionsPage() {
  const [showForm, setShowForm] = useState(false)

  const { filters, setFilters  } = useTransactionsContext();

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader
        title="Transacoes"
        description="Gerencie suas receitas e despesas"
        action={{
          label: "Nova Transacao",
          onClick: () => setShowForm(true),
        }}
      />

      <main className="flex-1 p-4 md:p-6 space-y-6">
        <TransactionsFilters
          month={filters.month ?? "all"}
          type={filters.type ?? "all"}
          onMonthChange={(month) => setFilters({ ...filters, month })}
          onTypeChange={(type) => setFilters({ ...filters, type })}
          onClearFilters={() => setFilters({ month: "all", type: "all" })}
        />

        <TransactionsList  />
      </main>

      <TransactionForm open={showForm} onOpenChange={setShowForm} />
    </div>
  )
}
