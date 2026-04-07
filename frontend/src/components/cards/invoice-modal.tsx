"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ArrowDownRight } from "lucide-react"

interface InvoiceModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  card: {
    id: string
    name: string
    lastDigits: string
    used: number
    dueDate: number
  } | null
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

const mockInvoiceTransactions = [
  { id: "1", description: "Supermercado Extra", amount: 456.78, date: "15 Jan", category: "🛒" },
  { id: "2", description: "Uber", amount: 32.5, date: "14 Jan", category: "🚗" },
  { id: "3", description: "Netflix", amount: 39.9, date: "13 Jan", category: "📺" },
  { id: "4", description: "iFood", amount: 89.0, date: "12 Jan", category: "🍔" },
  { id: "5", description: "Amazon", amount: 199.9, date: "10 Jan", category: "🛍️" },
  { id: "6", description: "Spotify", amount: 21.9, date: "08 Jan", category: "🎵" },
  { id: "7", description: "Farmacia", amount: 67.5, date: "05 Jan", category: "🏥" },
]

export function InvoiceModal({ open, onOpenChange, card }: InvoiceModalProps) {
  if (!card) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            Fatura - {card.name} (•••• {card.lastDigits})
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
            <div>
              <p className="text-sm text-muted-foreground">Total da Fatura</p>
              <p className="text-2xl font-bold">{formatCurrency(card.used)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Vencimento</p>
              <p className="font-medium">Dia {card.dueDate}</p>
            </div>
          </div>

          <div className="space-y-1">
            <h4 className="text-sm font-medium text-muted-foreground">
              Transacoes
            </h4>
            <div className="divide-y rounded-lg border">
              {mockInvoiceTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center gap-3 p-3"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-sm">
                    {transaction.category}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {transaction.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {transaction.date}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <ArrowDownRight className="h-3 w-3 text-destructive" />
                    <span className="text-sm font-medium text-destructive">
                      {formatCurrency(transaction.amount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
