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
import NotificationsPage from "./views/Notifications";
import TransactionsPage from "./views/Transactions";
import CategoriesPage from "./views/Categories";
import ProfilePage from "./views/Profile";
import CardsPage from "./views/Cards";
import BudgetsPage from "./views/Budgets";

export function App() {
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
            <Route index element={<Dashboard />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/budgets" element={<BudgetsPage />} />
            <Route path="/cards" element={<CardsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<ProfilePage />} />
            {/* ↑ tag aberta — rotas filhas renderizam no <Outlet /> do layout */}
          </Route>

          {/* ── 404 ────────────────────────────────────────────────────── */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}