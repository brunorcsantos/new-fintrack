


/**
 * src/views/Dashboard.tsx
 *
 * Placeholder da Fase 2. Demonstra o design system funcionando.
 */

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { ExpenseChart } from "@/components/dashboard/expense-chart";
import { MonthlyTrend } from "@/components/dashboard/monthly-trend";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";

export function Dashboard() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true)

  if (!user) return null;

  useEffect(() => {
    // Simula carregamento de dados
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const summaryData = {
    income: 10500,
    expenses: 5500,
    balance: 5000,
    savingsRate: 47.6,
  };

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader
        title="Dashboard"
        description="Visao geral das suas financas"
        action={{
          label: "Nova Transacao",
          href: "/dashboard/transactions/new",
        }}
      />

      <main className="flex-1 p-4 md:p-6 space-y-6">
        <SummaryCards data={summaryData} isLoading={isLoading} />

        <div className="grid gap-6 lg:grid-cols-2">
          <ExpenseChart isLoading={isLoading} />
          <MonthlyTrend isLoading={isLoading} />
        </div>

        <RecentTransactions isLoading={isLoading} />
      </main>
    </div>
  );
}
