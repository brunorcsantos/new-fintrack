"use client"

import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { BudgetsList } from "@/components/budgets/budgets-list"
import { BudgetForm } from "@/components/budgets/budget-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function BudgetsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  const totalBudget = 3500
  const totalSpent = 2740
  const percentage = Math.round((totalSpent / totalBudget) * 100)

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader
        title="Orcamentos"
        description="Defina limites mensais para suas categorias"
        action={{
          label: "Novo Orcamento",
          onClick: () => setShowForm(true),
        }}
      />

      <main className="flex-1 p-4 md:p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">
              Resumo do Mes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Gasto</span>
                  <span className="font-medium">{percentage}%</span>
                </div>
                <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-primary transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>

              <div className="flex gap-6 sm:gap-8">
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    R$ {totalSpent.toLocaleString("pt-BR")}
                  </p>
                  <p className="text-xs text-muted-foreground">Gasto</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-muted-foreground">
                    R$ {totalBudget.toLocaleString("pt-BR")}
                  </p>
                  <p className="text-xs text-muted-foreground">Limite Total</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <BudgetsList isLoading={isLoading} />
      </main>

      <BudgetForm open={showForm} onOpenChange={setShowForm} />
    </div>
  )
}
