import { AuthLayout } from "@/components/auth/auth-layout"
import { RegisterForm } from "@/components/auth/register-form"

export function Register() {
  return (
    <AuthLayout>
      <RegisterForm />
    </AuthLayout>
  )
}
