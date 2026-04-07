"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { BudgetCard } from "./budget-card"
import { BudgetForm } from "./budget-form"

interface Budget {
  id: string
  category: string
  categoryEmoji: string
  limit: number
  spent: number
  color: string
}

interface BudgetsListProps {
  budgets?: Budget[]
  isLoading?: boolean
}

const mockBudgets: Budget[] = [
  {
    id: "1",
    category: "Alimentacao",
    categoryEmoji: "🛒",
    limit: 1500,
    spent: 1200,
    color: "#f97316",
  },
  {
    id: "2",
    category: "Transporte",
    categoryEmoji: "🚗",
    limit: 600,
    spent: 450,
    color: "#eab308",
  },
  {
    id: "3",
    category: "Lazer",
    categoryEmoji: "🎮",
    limit: 500,
    spent: 580,
    color: "#ec4899",
  },
  {
    id: "4",
    category: "Assinaturas",
    categoryEmoji: "📺",
    limit: 200,
    spent: 120,
    color: "#06b6d4",
  },
  {
    id: "5",
    category: "Saude",
    categoryEmoji: "🏥",
    limit: 400,
    spent: 150,
    color: "#ef4444",
  },
  {
    id: "6",
    category: "Educacao",
    categoryEmoji: "📚",
    limit: 300,
    spent: 240,
    color: "#3b82f6",
  },
]

export function BudgetsList({
  budgets = mockBudgets,
  isLoading,
}: BudgetsListProps) {
  const [editBudget, setEditBudget] = useState<Budget | null>(null)

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-2 w-full rounded-full" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {budgets.map((budget) => (
          <BudgetCard
            key={budget.id}
            budget={budget}
            onEdit={() => setEditBudget(budget)}
          />
        ))}
      </div>

      <BudgetForm
        open={!!editBudget}
        onOpenChange={(open) => !open && setEditBudget(null)}
        budget={
          editBudget
            ? {
                id: editBudget.id,
                category: editBudget.category,
                limit: editBudget.limit,
              }
            : undefined
        }
      />
    </>
  )
}
