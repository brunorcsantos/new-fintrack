"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface MonthlyTrendProps {
  isLoading?: boolean
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    notation: "compact",
  }).format(value)
}

export function MonthlyTrend({ isLoading }: MonthlyTrendProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    )
  }

  const data = [
    { month: "Jan", income: 8500, expenses: 5500 },
    { month: "Fev", income: 8500, expenses: 4800 },
    { month: "Mar", income: 9200, expenses: 5200 },
    { month: "Abr", income: 8500, expenses: 6100 },
    { month: "Mai", income: 10500, expenses: 5800 },
    { month: "Jun", income: 8500, expenses: 5500 },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium">
          Tendencia Mensal
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--chart-1)"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--chart-1)"
                    stopOpacity={0}
                  />
                </linearGradient>
                <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--chart-2)"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--chart-2)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-muted"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                className="text-muted-foreground"
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => formatCurrency(value)}
                className="text-muted-foreground"
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-3 shadow-md">
                        <p className="font-medium mb-2">{label}</p>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-chart-1" />
                              <span className="text-sm text-muted-foreground">
                                Receitas
                              </span>
                            </div>
                            <span className="text-sm font-medium text-success">
                              {formatCurrency(payload[0].value as number)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-chart-2" />
                              <span className="text-sm text-muted-foreground">
                                Despesas
                              </span>
                            </div>
                            <span className="text-sm font-medium text-destructive">
                              {formatCurrency(payload[1].value as number)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Area
                type="monotone"
                dataKey="income"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                fill="url(#incomeGradient)"
              />
              <Area
                type="monotone"
                dataKey="expenses"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                fill="url(#expenseGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-chart-1" />
            <span className="text-sm text-muted-foreground">Receitas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-chart-2" />
            <span className="text-sm text-muted-foreground">Despesas</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
