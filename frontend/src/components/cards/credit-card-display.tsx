"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Pencil, Trash2, Eye } from "lucide-react"

interface CreditCardDisplayProps {
  card: {
    id: string
    name: string
    lastDigits: string
    brand: string
    limit: number
    used: number
    dueDate: number
    color: string
  }
  onEdit?: () => void
  onDelete?: () => void
  onViewInvoice?: () => void
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

export function CreditCardDisplay({
  card,
  onEdit,
  onDelete,
  onViewInvoice,
}: CreditCardDisplayProps) {
  const available = card.limit - card.used
  const usedPercentage = Math.round((card.used / card.limit) * 100)

  return (
    <Card className="overflow-hidden group">
      {/* Card Visual */}
      <div
        className="relative h-44 p-5 text-white"
        style={{
          background: `linear-gradient(135deg, ${card.color}, ${card.color}dd)`,
        }}
      >
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm opacity-80">{card.brand}</p>
            <p className="font-medium mt-1">{card.name}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger >
              <div
                className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Acoes</span>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onViewInvoice}>
                <Eye className="mr-2 h-4 w-4" />
                Ver Fatura
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onEdit}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="absolute bottom-5 left-5 right-5">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-2xl tracking-wider font-mono">
                •••• {card.lastDigits}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs opacity-80">Vencimento</p>
              <p className="text-sm font-medium">Dia {card.dueDate}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Card Info */}
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Fatura Atual</span>
          <span className="font-medium">{formatCurrency(card.used)}</span>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{usedPercentage}% do limite</span>
            <span>Disponivel: {formatCurrency(available)}</span>
          </div>
          <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full transition-all duration-500"
              style={{
                width: `${usedPercentage}%`,
                backgroundColor:
                  usedPercentage >= 80
                    ? "hsl(var(--destructive))"
                    : "hsl(var(--primary))",
              }}
            />
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Limite: {formatCurrency(card.limit)}
        </p>
      </CardContent>
    </Card>
  )
}
