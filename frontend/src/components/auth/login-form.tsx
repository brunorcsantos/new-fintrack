import { useState, useId } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Eye, EyeOff, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { SocialAuthButtons } from "@/components/auth/social-auth-buttons"
import { useAuth } from "@/context/AuthContext"
import type { ApiError } from "@/types"

export function LoginForm() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const emailId = useId()
  const passwordId = useId()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    try {
      // AuthContext.login não navega mais — a view é responsável
      await login(email, password)
      navigate("/", { replace: true })
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.message ?? "Erro ao fazer login.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Bem-vindo de volta</h1>
        <p className="text-sm text-muted-foreground">Entre na sua conta para continuar</p>
      </div>

      <SocialAuthButtons mode="login" />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">ou continue com email</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor={emailId}>Email</Label>
          <Input
            id={emailId}
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor={passwordId}>Senha</Label>
            <Link to="/forgot-password" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Esqueceu a senha?
            </Link>
          </div>
          <div className="relative">
            <Input
              id={passwordId}
              type={showPassword ? "text" : "password"}
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              className="h-11 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <Button type="submit" className="w-full h-11" disabled={isLoading}>
          {isLoading ? (
            <><Spinner className="h-4 w-4" /><span>Entrando...</span></>
          ) : "Entrar"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Ainda não tem uma conta?{" "}
        <Link to="/register" className="font-medium text-foreground hover:underline">
          Criar conta
        </Link>
      </p>
    </div>
  )
}
