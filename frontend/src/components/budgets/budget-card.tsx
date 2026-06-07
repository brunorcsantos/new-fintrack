"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Pencil, Trash2, AlertTriangle } from "lucide-react"

interface BudgetCardProps {
  budget: {
    id: string
    category: string
    categoryEmoji: string
    limit: number
    spent: number
    color: string
  }
  onEdit?: () => void
  onDelete?: () => void
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

export function BudgetCard({ budget, onEdit, onDelete }: BudgetCardProps) {
  const percentage = Math.min((budget.spent / budget.limit) * 100, 100)
  const remaining = budget.limit - budget.spent
  const isOverBudget = budget.spent > budget.limit
  const isWarning = percentage >= 80 && !isOverBudget

  return (
    <Card className="group">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full text-lg"
              style={{ backgroundColor: `${budget.color}20` }}
            >
              {budget.categoryEmoji}
            </div>
            <div>
              <CardTitle className="text-base font-medium">
                {budget.category}
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Limite: {formatCurrency(budget.limit)}
              </p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger>
              <div
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Acoes</span>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Gasto: {formatCurrency(budget.spent)}
            </span>
            <span
              className={`font-medium ${
                isOverBudget
                  ? "text-destructive"
                  : isWarning
                    ? "text-chart-4"
                    : "text-muted-foreground"
              }`}
            >
              {percentage.toFixed(0)}%
            </span>
          </div>

          <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full transition-all duration-500"
              style={{
                width: `${percentage}%`,
                backgroundColor: isOverBudget
                  ? "hsl(var(--destructive))"
                  : isWarning
                    ? "hsl(var(--chart-4))"
                    : budget.color,
              }}
            />
          </div>
        </div>

        <div
          className={`flex items-center gap-2 text-sm ${
            isOverBudget ? "text-destructive" : "text-muted-foreground"
          }`}
        >
          {isOverBudget && <AlertTriangle className="h-4 w-4" />}
          <span>
            {isOverBudget
              ? `Excedido em ${formatCurrency(Math.abs(remaining))}`
              : `Restam ${formatCurrency(remaining)}`}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
