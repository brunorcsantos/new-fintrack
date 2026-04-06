"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowDownRight, ArrowUpRight, Wallet, TrendingUp } from "lucide-react"

interface SummaryCardsProps {
  data?: {
    income: number
    expenses: number
    balance: number
    savingsRate: number
  }
  isLoading?: boolean
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

export function SummaryCards({ data, isLoading }: SummaryCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4 rounded" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32 mb-1" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const cards = [
    {
      title: "Receitas",
      value: data?.income ?? 0,
      change: "+12.5%",
      changeType: "positive" as const,
      icon: ArrowUpRight,
      iconBg: "bg-success/10",
      iconColor: "text-success",
    },
    {
      title: "Despesas",
      value: data?.expenses ?? 0,
      change: "-3.2%",
      changeType: "negative" as const,
      icon: ArrowDownRight,
      iconBg: "bg-destructive/10",
      iconColor: "text-destructive",
    },
    {
      title: "Saldo",
      value: data?.balance ?? 0,
      change: "+8.1%",
      changeType: "positive" as const,
      icon: Wallet,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      title: "Taxa de Poupanca",
      value: data?.savingsRate ?? 0,
      isPercentage: true,
      change: "+2.3%",
      changeType: "positive" as const,
      icon: TrendingUp,
      iconBg: "bg-chart-3/10",
      iconColor: "text-chart-3",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${card.iconBg}`}>
              <card.icon className={`h-4 w-4 ${card.iconColor}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {card.isPercentage
                ? `${card.value.toFixed(1)}%`
                : formatCurrency(card.value)}
            </div>
            <p
              className={`text-xs mt-1 ${
                card.changeType === "positive"
                  ? "text-success"
                  : "text-destructive"
              }`}
            >
              {card.change} em relacao ao mes anterior
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
