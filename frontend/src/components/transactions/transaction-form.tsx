"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { TxTypeFilter } from "@/types"

interface TransactionFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction?: {
    id: string
    description: string
    amount: number
    type: TxTypeFilter
    category: string
    date: string
  }
}

const categories = [
  { id: "salary", name: "Salario", emoji: "💼" },
  { id: "freelance", name: "Freelance", emoji: "💻" },
  { id: "food", name: "Alimentacao", emoji: "🛒" },
  { id: "transport", name: "Transporte", emoji: "🚗" },
  { id: "housing", name: "Moradia", emoji: "🏠" },
  { id: "entertainment", name: "Lazer", emoji: "🎮" },
  { id: "health", name: "Saude", emoji: "🏥" },
  { id: "education", name: "Educacao", emoji: "📚" },
  { id: "shopping", name: "Compras", emoji: "🛍️" },
  { id: "subscriptions", name: "Assinaturas", emoji: "📺" },
  { id: "other", name: "Outros", emoji: "📦" },
]

export function TransactionForm({
  open,
  onOpenChange,
  transaction,
}: TransactionFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    description: transaction?.description ?? "",
    amount: transaction?.amount?.toString() ?? "",
    type: transaction?.type ?? "expense",
    category: transaction?.category ?? "",
    date: transaction?.date ?? new Date().toISOString().split("T")[0],
  })

  const isEditing = !!transaction

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simula salvamento
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setIsLoading(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Transacao" : "Nova Transacao"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize os dados da transacao"
              : "Adicione uma nova transacao ao seu historico"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">Tipo</Label>
            <Select
              value={formData.type}
              onValueChange={(value) =>
                setFormData({ ...formData, type: value as "income" | "expense" })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="income">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-success" />
                    Receita
                  </span>
                </SelectItem>
                <SelectItem value="expense">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-destructive" />
                    Despesa
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descricao</Label>
            <Input
              id="description"
              placeholder="Ex: Supermercado Extra"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Valor</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                R$
              </span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                className="pl-10"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select
              value={formData.category}
              onValueChange={(value) =>
                setFormData({ ...formData, category: value })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <span className="flex items-center gap-2">
                      <span>{category.emoji}</span>
                      {category.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Data</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              required
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Spinner className="h-4 w-4" />
                  Salvando...
                </>
              ) : isEditing ? (
                "Salvar"
              ) : (
                "Adicionar"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
