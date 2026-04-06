/**
 * src/components/ProtectedRoute.tsx
 *
 * Guarda de rota autenticada.
 *
 * Comportamento:
 *   isLoading        → exibe spinner centralizado (evita flash da tela de login)
 *   !isAuthenticated → redireciona para /login
 *   isAuthenticated  → renderiza o children normalmente
 */

import { Navigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { Spinner } from "@/components/ui/spinner"
import type { ReactNode } from "react"

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Spinner className="w-8 h-8" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
