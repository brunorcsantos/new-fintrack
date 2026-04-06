import { Link } from "react-router-dom"

export function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-background">
      <div className="text-center space-y-2">
        <h1 className="text-8xl font-bold text-foreground">404</h1>
        <p className="text-xl text-muted-foreground">Página não encontrada</p>
        <p className="text-sm text-muted-foreground max-w-sm">
          A página que você está procurando não existe ou foi movida.
        </p>
      </div>
      <Link
        to="/"
        className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        Voltar para o início
      </Link>
    </div>
  )
}
