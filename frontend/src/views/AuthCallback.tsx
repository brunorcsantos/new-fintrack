/**
 * src/views/AuthCallback.tsx
 *
 * Processa o retorno OAuth lendo tokens do hash fragment da URL.
 * Redireciona para / em caso de sucesso ou exibe erro.
 */

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Spinner } from "@/components/ui/spinner"
import { api } from "@/lib/api"
import type { AuthUser } from "@/types"

export function AuthCallback() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function processCallback() {
      const hash = window.location.hash.slice(1)
      const params = new URLSearchParams(hash)
      const accessToken = params.get("accessToken")
      const refreshToken = params.get("refreshToken")

      if (!accessToken || !refreshToken) {
        setError("Tokens ausentes no callback OAuth. Tente fazer login novamente.")
        return
      }

      api.setTokens({ accessToken, refreshToken })

      try {
        await api.get<AuthUser>("/auth/me")
        // Limpa o hash da URL antes de navegar
        window.history.replaceState(null, "", "/auth/callback")
        navigate("/", { replace: true })
      } catch {
        api.clearTokens()
        setError("Falha ao verificar a sessão. Tente novamente.")
      }
    }

    processCallback()
  }, [navigate])

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-8 bg-background text-center">
        <span className="text-4xl">⚠️</span>
        <p className="text-muted-foreground max-w-sm">{error}</p>
        <a
          href="/login"
          className="text-primary text-sm font-medium hover:underline"
        >
          Voltar para o login
        </a>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
      <Spinner className="w-8 h-8" />
      <p className="text-sm text-muted-foreground">Finalizando login...</p>
    </div>
  )
}
