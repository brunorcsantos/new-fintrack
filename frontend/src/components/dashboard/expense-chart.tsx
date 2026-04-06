"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface ExpenseChartProps {
  data?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  isLoading?: boolean;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function ExpenseChart({ data, isLoading }: ExpenseChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]">
            <Skeleton className="h-48 w-48 rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = data ?? [
    { name: "Alimentacao", value: 1200, color: "var(--chart-1)" },
    { name: "Transporte", value: 800, color: "var(--chart-2)" },
    { name: "Moradia", value: 1500, color: "var(--chart-3)" },
    { name: "Lazer", value: 500, color: "var(--chart-4)" },
    { name: "Outros", value: 320, color: "var(--chart-5)" },
  ];

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium">
          Despesas por Categoria
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    const percentage = ((data.value / total) * 100).toFixed(1);
                    return (
                      <div className="rounded-lg border bg-background p-3 shadow-md">
                        <p className="font-medium">{data.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(data.value)} ({percentage}%)
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                content={({ payload }) => (
                  <div className="flex flex-wrap justify-center gap-4 mt-4">
                    {payload?.map((entry, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-xs text-muted-foreground">
                          {entry.value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
