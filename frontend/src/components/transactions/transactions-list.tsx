"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { TransactionForm } from "./transaction-form";
import { useTransactionsContext } from "@/hooks/useTransactionsContext";
import type { Transaction } from "@/types"
import { toNumber } from "@/lib/utils";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}


export function TransactionsList() {
  const [editTransaction, setEditTransaction] = useState<Transaction | null>(
    null,
  );
  const { transactions, fetchTransactions, isLoading, filters } = useTransactionsContext();

  useEffect(() => {
    try {
      fetchTransactions();
    } catch (error) {
      console.log("Erro");
    }
  }, [filters]);

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
    );
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
                  {transaction.category.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {transaction.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {transaction.category.name} • {formatDate(transaction.date)}
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
                      {formatCurrency(toNumber(transaction.amount))}
                    </span>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <div className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Acoes</span>
                      </div>
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
                amount: toNumber(editTransaction.amount),
                type: editTransaction.type,
                category: editTransaction.category.id,
                date: editTransaction.date,
              }
            : undefined
        }
      />
    </>
  );
}
