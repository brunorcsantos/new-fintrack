import { useEffect, useState } from "react";
import { dashboardService, type SummaryData, type Transaction } from "@/services/dashboard";

export function useDashboard() {
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const [summary, txs] = await Promise.all([
          dashboardService.getSummary(),
          dashboardService.getTransactions(),
        ]);
        setSummaryData(summary);
        setTransactions(txs);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro ao carregar dados");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  return { summaryData, transactions, isLoading, error };
}