"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react"
import { TransactionForm } from "./transaction-form"

interface Transaction {
  id: string
  description: string
  amount: number
  type: "income" | "expense"
  category: string
  categoryEmoji: string
  date: string
}

interface TransactionsListProps {
  transactions?: Transaction[]
  isLoading?: boolean
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date)
}

const mockTransactions: Transaction[] = [
  {
    id: "1",
    description: "Salario",
    amount: 8500,
    type: "income",
    category: "Salario",
    categoryEmoji: "💼",
    date: "2024-01-15",
  },
  {
    id: "2",
    description: "Supermercado Extra",
    amount: 456.78,
    type: "expense",
    category: "Alimentacao",
    categoryEmoji: "🛒",
    date: "2024-01-14",
  },
  {
    id: "3",
    description: "Uber",
    amount: 32.5,
    type: "expense",
    category: "Transporte",
    categoryEmoji: "🚗",
    date: "2024-01-14",
  },
  {
    id: "4",
    description: "Netflix",
    amount: 39.9,
    type: "expense",
    category: "Assinaturas",
    categoryEmoji: "📺",
    date: "2024-01-13",
  },
  {
    id: "5",
    description: "Freelance Design",
    amount: 2000,
    type: "income",
    category: "Freelance",
    categoryEmoji: "💻",
    date: "2024-01-12",
  },
  {
    id: "6",
    description: "Aluguel",
    amount: 2500,
    type: "expense",
    category: "Moradia",
    categoryEmoji: "🏠",
    date: "2024-01-10",
  },
  {
    id: "7",
    description: "Conta de Luz",
    amount: 180.45,
    type: "expense",
    category: "Moradia",
    categoryEmoji: "🏠",
    date: "2024-01-08",
  },
  {
    id: "8",
    description: "Restaurante",
    amount: 125.0,
    type: "expense",
    category: "Alimentacao",
    categoryEmoji: "🛒",
    date: "2024-01-07",
  },
  {
    id: "9",
    description: "Spotify",
    amount: 21.9,
    type: "expense",
    category: "Assinaturas",
    categoryEmoji: "📺",
    date: "2024-01-05",
  },
  {
    id: "10",
    description: "Rendimento Investimentos",
    amount: 350.0,
    type: "income",
    category: "Investimentos",
    categoryEmoji: "📈",
    date: "2024-01-03",
  },
]

export function TransactionsList({
  transactions = mockTransactions,
  isLoading,
}: TransactionsListProps) {
  const [editTransaction, setEditTransaction] = useState<Transaction | null>(
    null
  )

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-lg shrink-0">
                  {transaction.categoryEmoji}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {transaction.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {transaction.category} • {formatDate(transaction.date)}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-right">
                    {transaction.type === "income" ? (
                      <ArrowUpRight className="h-4 w-4 text-success" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-destructive" />
                    )}
                    <span
                      className={`font-medium tabular-nums ${
                        transaction.type === "income"
                          ? "text-success"
                          : "text-destructive"
                      }`}
                    >
                      {transaction.type === "income" ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </span>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Acoes</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => setEditTransaction(transaction)}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <TransactionForm
        open={!!editTransaction}
        onOpenChange={(open) => !open && setEditTransaction(null)}
        transaction={
          editTransaction
            ? {
                id: editTransaction.id,
                description: editTransaction.description,
                amount: editTransaction.amount,
                type: editTransaction.type,
                category: editTransaction.category,
                date: editTransaction.date,
              }
            : undefined
        }
      />
    </>
  )
}
