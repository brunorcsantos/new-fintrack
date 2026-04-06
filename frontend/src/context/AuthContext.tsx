/**
 * src/context/AuthContext.tsx
 *
 * Contexto global de autenticação.
 *
 * Responsabilidades:
 * - Armazenar o usuário autenticado e estado de loading
 * - Expor funções de login, register, logout e loginWithOAuth
 * - Escutar o evento "fintrack:logout" disparado pelo ApiClient
 *   quando o refresh token expira (logout automático por sessão)
 *
 * DECISÃO DE DESIGN: login() e register() NÃO navegam.
 * A navegação pós-autenticação é responsabilidade do componente que
 * chama a função (LoginForm, RegisterForm). Isso evita:
 *   1. Dupla navegação (contexto + componente)
 *   2. Acoplar o contexto ao fluxo de navegação da UI
 *   3. Dificuldade de testar os contextos isoladamente
 *
 * logout() navega para /login porque é sempre o comportamento correto,
 * independentemente de onde o logout é acionado.
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react"
import { useNavigate } from "react-router-dom"
import { api } from "@/lib/api"
import type { AuthUser } from "@/types"

// ─── Tipos do contexto ────────────────────────────────────────────────────────

type AuthContextValue = {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean

  // login/register retornam o usuário para que a view possa navegar depois
  login: (email: string, password: string) => Promise<AuthUser>
  register: (name: string, email: string, password: string) => Promise<AuthUser>
  logout: () => Promise<void>
  loginWithGoogle: () => void
  loginWithGitHub: () => void
  updateUser: (updates: Partial<AuthUser>) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  // Verifica sessão persistida ao montar
  useEffect(() => {
    async function checkSession() {
      if (!api.isAuthenticated()) {
        setIsLoading(false)
        return
      }
      try {
        const me = await api.get<AuthUser>("/auth/me")
        setUser(me)
      } catch {
        api.clearTokens()
      } finally {
        setIsLoading(false)
      }
    }
    checkSession()
  }, [])

  // Logout automático quando o refresh token expira
  useEffect(() => {
    function handleAutoLogout() {
      setUser(null)
      navigate("/login", { replace: true })
    }
    window.addEventListener("fintrack:logout", handleAutoLogout)
    return () => window.removeEventListener("fintrack:logout", handleAutoLogout)
  }, [navigate])

  // ── Ações ──────────────────────────────────────────────────────────────────

  /**
   * Autentica o usuário e popula o contexto.
   * NÃO navega — deixa isso para o componente chamador.
   * Retorna o AuthUser para que a view possa usar se precisar.
   */
  const login = useCallback(async (email: string, password: string): Promise<AuthUser> => {
    await api.login(email, password)
    const me = await api.get<AuthUser>("/auth/me")
    setUser(me)
    return me
  }, [])

  /**
   * Registra o usuário e popula o contexto.
   * NÃO navega — deixa isso para o componente chamador.
   */
  const register = useCallback(async (
    name: string,
    email: string,
    password: string
  ): Promise<AuthUser> => {
    await api.register(name, email, password)
    const me = await api.get<AuthUser>("/auth/me")
    setUser(me)
    return me
  }, [])

  /**
   * Encerra a sessão. Navega para /login.
   * O comportamento de ir para /login é invariante — sempre correto.
   */
  const logout = useCallback(async () => {
    await api.logout()
    setUser(null)
    navigate("/login", { replace: true })
  }, [navigate])

  const loginWithGoogle = useCallback(() => api.loginWithGoogle(), [])
  const loginWithGitHub = useCallback(() => api.loginWithGitHub(), [])

  const updateUser = useCallback((updates: Partial<AuthUser>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null))
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: user !== null,
        login,
        register,
        logout,
        loginWithGoogle,
        loginWithGitHub,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>")
  return ctx
}
