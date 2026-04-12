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
import { useDashboard } from "@/hooks/useDashboard";
import { formatMonth } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

export function Dashboard() {
  const { user } = useAuth();
  const { summary, chartData, recentTransactions, month, isLoading, error } =
    useDashboard();

  if (!user) return null;

  if (error) {
    return (
      <div className="flex flex-col min-h-screen">
        <DashboardHeader title="Dashboard" description={formatMonth(month)} />
        <main className="flex-1 p-4 md:p-6 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-center">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <p className="text-muted-foreground text-sm max-w-xs">{error}</p>
          </div>
        </main>
      </div>
    );
  }

  const summaryData = summary ?? {
    income: 0,
    expenses: 0,
    balance: 0,
    savingsRate: 0,
  };

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader
        title="Dashboard"
        description={`Visao geral de ${formatMonth(month)}`}
        action={{
          label: "Nova Transacao",
          href: "/transactions",
        }}
      />

      <main className="flex-1 p-4 md:p-6 space-y-6">
        <SummaryCards data={summaryData} isLoading={isLoading} />

        <div className="grid gap-6 lg:grid-cols-2">
          <ExpenseChart data={chartData.length > 0 ? chartData : undefined} isLoading={isLoading} />
          <MonthlyTrend isLoading={isLoading} />
        </div>

        <RecentTransactions transactions={recentTransactions.length > 0 ? recentTransactions : undefined} isLoading={isLoading} />
      </main>
    </div>
  );
}
