import { createContext, ReactNode, useContext, useState } from "react";
import { useTransactions, type UseTransactionsReturn } from "@/hooks/useTransactions"

export type TransactionsContextValue = UseTransactionsReturn



export const TransactionsContext = createContext<TransactionsContextValue | null>(
  null,
);

export function TransactionsProvider({children}: {children: ReactNode}){
  
  const transactions = useTransactions();

  return (
    <TransactionsContext.Provider value={transactions}>
      {children}
    </TransactionsContext.Provider>
  )
}

