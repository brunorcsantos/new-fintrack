import { AuthLayout } from "@/components/auth/auth-layout"
import { LoginForm } from "@/components/auth/login-form"

export function Login() {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  )
}
