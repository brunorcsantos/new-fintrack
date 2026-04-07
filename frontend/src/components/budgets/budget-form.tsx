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

interface BudgetFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  budget?: {
    id: string
    category: string
    limit: number
  }
}

const categories = [
  { id: "food", name: "Alimentacao", emoji: "🛒" },
  { id: "transport", name: "Transporte", emoji: "🚗" },
  { id: "housing", name: "Moradia", emoji: "🏠" },
  { id: "entertainment", name: "Lazer", emoji: "🎮" },
  { id: "health", name: "Saude", emoji: "🏥" },
  { id: "education", name: "Educacao", emoji: "📚" },
  { id: "shopping", name: "Compras", emoji: "🛍️" },
  { id: "subscriptions", name: "Assinaturas", emoji: "📺" },
]

export function BudgetForm({ open, onOpenChange, budget }: BudgetFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    category: budget?.category ?? "",
    limit: budget?.limit?.toString() ?? "",
  })

  const isEditing = !!budget

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    await new Promise((resolve) => setTimeout(resolve, 1000))

    setIsLoading(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Orcamento" : "Novo Orcamento"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize o limite do orcamento"
              : "Defina um limite mensal para uma categoria"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select
              value={formData.category}
              onValueChange={(value) =>
                setFormData({ ...formData, category: value })
              }
              disabled={isEditing}
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
            <Label htmlFor="limit">Limite Mensal</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                R$
              </span>
              <Input
                id="limit"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                className="pl-10"
                value={formData.limit}
                onChange={(e) =>
                  setFormData({ ...formData, limit: e.target.value })
                }
                required
              />
            </div>
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
                "Criar"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
