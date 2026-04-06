"use client"

import {Link} from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowRight, ArrowUpRight, ArrowDownRight } from "lucide-react"

interface Transaction {
  id: string
  description: string
  amount: number
  type: "income" | "expense"
  category: string
  categoryEmoji: string
  date: string
}

interface RecentTransactionsProps {
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
  }).format(date)
}

export function RecentTransactions({
  transactions,
  isLoading,
}: RecentTransactionsProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-8 w-20" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const mockTransactions: Transaction[] = transactions ?? [
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
  ]

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-medium">
          Ultimas Transacoes
        </CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/dashboard/transactions">
            Ver todas
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center gap-4 group"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-lg">
                {transaction.categoryEmoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{transaction.description}</p>
                <p className="text-xs text-muted-foreground">
                  {transaction.category} • {formatDate(transaction.date)}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
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
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
