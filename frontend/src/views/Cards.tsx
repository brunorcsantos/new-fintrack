"use client"

import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { CardsList } from "@/components/cards/cards-list"
import { CardForm } from "@/components/cards/card-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function CardsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  const totalLimit = 35000
  const totalUsed = 11541.25
  const usedPercentage = Math.round((totalUsed / totalLimit) * 100)

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader
        title="Cartoes de Credito"
        description="Gerencie seus cartoes e faturas"
        action={{
          label: "Novo Cartao",
          onClick: () => setShowForm(true),
        }}
      />

      <main className="flex-1 p-4 md:p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">
              Resumo dos Cartoes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Limite Utilizado</span>
                  <span className="font-medium">{usedPercentage}%</span>
                </div>
                <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-primary transition-all duration-500"
                    style={{ width: `${usedPercentage}%` }}
                  />
                </div>
              </div>

              <div className="flex gap-6 sm:gap-8">
                <div className="text-center">
                  <p className="text-2xl font-bold">
                    R$ {totalUsed.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-muted-foreground">Em Faturas</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-muted-foreground">
                    R$ {totalLimit.toLocaleString("pt-BR")}
                  </p>
                  <p className="text-xs text-muted-foreground">Limite Total</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <CardsList isLoading={isLoading} />
      </main>

      <CardForm open={showForm} onOpenChange={setShowForm} />
    </div>
  )
}
