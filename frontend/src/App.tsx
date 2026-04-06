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