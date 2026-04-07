import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Login } from "@/views/Login";
import { Register } from "@/views/Register";
import { AuthCallback } from "@/views/AuthCallback";
import DashboardLayout from "@/views/DashboardLayout";
import { Dashboard } from "@/views/Dashboard";
import { NotFound } from "@/views/NotFound";
import Transactions from "./views/Transactions";
import NotificationsPage from "./views/Notifications";
import TransactionsPage from "./views/Transactions";
import CategoriesPage from "./views/Categories";
import ProfilePage from "./views/Profile";
import CardsPage from "./views/Cards";
import BudgetsPage from "./views/Budgets";

export function App({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          {/* ── Públicas ───────────────────────────────────────────────── */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* ── Protegidas ─────────────────────────────────────────────── */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/register" element={<Register />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/cards" element={<CardsPage />} />
            <Route path="/budgets" element={<BudgetsPage />} />
            {/* ↑ tag aberta — rotas filhas renderizam no <Outlet /> do layout */}
            <Route index element={<Dashboard />} />
          </Route>

          {/* ── 404 ────────────────────────────────────────────────────── */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}