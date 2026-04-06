import { useState, useId } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Eye, EyeOff, AlertCircle, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { SocialAuthButtons } from "@/components/auth/social-auth-buttons"
import { useAuth } from "@/context/AuthContext"
import type { ApiError } from "@/types"

export function RegisterForm() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const nameId = useId()
  const emailId = useId()
  const passwordId = useId()

  const passwordRequirements = [
    { text: "Pelo menos 8 caracteres", met: password.length >= 8 },
    { text: "Uma letra maiúscula", met: /[A-Z]/.test(password) },
    { text: "Um número", met: /\d/.test(password) },
  ]
  const allRequirementsMet = passwordRequirements.every((r) => r.met)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!allRequirementsMet) {
      setError("A senha não atende todos os requisitos.")
      return
    }
    setError(null)
    setIsLoading(true)
    try {
      // AuthContext.register não navega mais — a view é responsável
      await register(name, email, password)
      navigate("/", { replace: true })
    } catch (err) {
      const apiError = err as ApiError
      setError(
        apiError.error === "EMAIL_ALREADY_EXISTS"
          ? "Este e-mail já está cadastrado. Tente fazer login."
          : (apiError.message ?? "Erro ao criar conta.")
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Crie sua conta</h1>
        <p className="text-sm text-muted-foreground">Comece a controlar suas finanças hoje</p>
      </div>

      <SocialAuthButtons mode="register" />

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
          <Label htmlFor={nameId}>Nome completo</Label>
          <Input id={nameId} type="text" placeholder="Seu nome" value={name} onChange={(e) => setName(e.target.value)} required disabled={isLoading} className="h-11" />
        </div>

        <div className="space-y-2">
          <Label htmlFor={emailId}>Email</Label>
          <Input id={emailId} type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading} className="h-11" />
        </div>

        <div className="space-y-2">
          <Label htmlFor={passwordId}>Senha</Label>
          <div className="relative">
            <Input
              id={passwordId}
              type={showPassword ? "text" : "password"}
              placeholder="Crie uma senha forte"
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
          {password && (
            <ul className="mt-2 space-y-1">
              {passwordRequirements.map((req, i) => (
                <li key={i} className={`flex items-center gap-2 text-xs ${req.met ? "text-success" : "text-muted-foreground"}`}>
                  <Check className={`h-3 w-3 ${req.met ? "opacity-100" : "opacity-30"}`} />
                  {req.text}
                </li>
              ))}
            </ul>
          )}
        </div>

        <Button type="submit" className="w-full h-11" disabled={isLoading || !allRequirementsMet}>
          {isLoading ? (
            <><Spinner className="h-4 w-4" /><span>Criando conta...</span></>
          ) : "Criar conta"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Já tem uma conta?{" "}
        <Link to="/login" className="font-medium text-foreground hover:underline">Entrar</Link>
      </p>
    </div>
  )
}
