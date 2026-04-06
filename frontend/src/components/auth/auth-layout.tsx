import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"

interface AuthLayoutProps {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Form */}
      <div className="flex-1 flex flex-col">
        <header className="flex items-center justify-between p-6">
          <Logo />
          <ThemeToggle />
        </header>
        <main className="flex-1 flex items-center justify-center px-6 pb-12">
          {children}
        </main>
      </div>

      {/* Right Panel — Decorativo (oculto em mobile) */}
      <div className="hidden lg:flex lg:flex-1 bg-muted items-center justify-center p-12">
        <div className="max-w-md space-y-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-semibold tracking-tight text-balance">
              Controle suas finanças com clareza e simplicidade
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              FinTrack ajuda você a visualizar receitas, despesas e orçamentos
              de forma intuitiva. Tome decisões financeiras inteligentes com
              dados claros e acessíveis.
            </p>
          </div>

          <div className="space-y-4 pt-4">
            {[
              { title: "Dashboard intuitivo", desc: "Visualize todas as suas finanças em um só lugar" },
              { title: "Categorias personalizáveis", desc: "Organize seus gastos do seu jeito" },
              { title: "Orçamentos inteligentes", desc: "Defina limites e acompanhe em tempo real" },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-success/10 text-success">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
