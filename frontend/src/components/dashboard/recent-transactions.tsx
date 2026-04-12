import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { formatCurrency, formatDate } from "../../lib/utils";
import type { Transaction } from "@/types";

interface RecentTransactionsProps {
  transactions?: Transaction[];
  isLoading?: boolean;
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
    );
  }

  // Sem dados após o carregamento
  if (!transactions || transactions.length === 0) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-medium">
            Últimas Transações
          </CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/transactions">
              Ver todas
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-6">
            Nenhuma transação registrada este mês.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-medium">
          Ultimas Transacoes
        </CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/transactions">
            Ver todas
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((tx) => (
            <div key={tx.id} className="flex items-center gap-4 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-lg">
                {tx.category?.icon ?? "📦"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{tx.description}</p>
                <p className="text-xs text-muted-foreground">
                  {tx.category?.name ?? "—"} • {formatDate(tx.date, "short")}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                {tx.type === "income" ? (
                  <ArrowUpRight className="h-4 w-4 text-success" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-destructive" />
                )}
                <span
                  className={`font-medium tabular-nums ${
                    tx.type === "income" ? "text-success" : "text-destructive"
                  }`}
                >
                  {tx.type === "income" ? "+" : "-"}
                  {formatCurrency(tx.amount)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
