import { api } from "@/lib/api";

export type SummaryData = {
  income: number;
  expenses: number;
  balance: number;
  savingsRate: number;
};

export type Transaction = {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: string;
};

export const dashboardService = {
  getSummary: () => api.get<SummaryData>("/dashboard/summary"),
  getTransactions: () => api.get<Transaction[]>("/dashboard/transactions"),
};