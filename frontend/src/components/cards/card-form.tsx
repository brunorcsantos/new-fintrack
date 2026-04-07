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

interface CardFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  card?: {
    id: string
    name: string
    lastDigits: string
    brand: string
    limit: number
    dueDate: number
    color: string
  }
}

const brands = ["Visa", "Mastercard", "Elo", "American Express", "Hipercard"]

const colors = [
  "#8A05BE", "#003366", "#FF7A00", "#1A1A1A",
  "#00875F", "#DC143C", "#4169E1", "#FF6B6B",
]

export function CardForm({ open, onOpenChange, card }: CardFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: card?.name ?? "",
    lastDigits: card?.lastDigits ?? "",
    brand: card?.brand ?? "",
    limit: card?.limit?.toString() ?? "",
    dueDate: card?.dueDate?.toString() ?? "",
    color: card?.color ?? colors[0],
  })

  const isEditing = !!card

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    await new Promise((resolve) => setTimeout(resolve, 1000))

    setIsLoading(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Cartao" : "Novo Cartao"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize os dados do cartao"
              : "Adicione um novo cartao de credito"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Cartao</Label>
              <Input
                id="name"
                placeholder="Ex: Nubank"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastDigits">Ultimos 4 Digitos</Label>
              <Input
                id="lastDigits"
                placeholder="1234"
                maxLength={4}
                value={formData.lastDigits}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    lastDigits: e.target.value.replace(/\D/g, ""),
                  })
                }
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brand">Bandeira</Label>
              <Select
                value={formData.brand}
                onValueChange={(value) =>
                  setFormData({ ...formData, brand: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((brand) => (
                    <SelectItem key={brand} value={brand}>
                      {brand}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Dia de Vencimento</Label>
              <Input
                id="dueDate"
                type="number"
                min="1"
                max="31"
                placeholder="15"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="limit">Limite</Label>
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

          <div className="space-y-2">
            <Label>Cor do Cartao</Label>
            <div className="flex flex-wrap gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`h-8 w-8 rounded-lg transition-all ${
                    formData.color === color
                      ? "ring-2 ring-ring ring-offset-2 ring-offset-background"
                      : ""
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setFormData({ ...formData, color })}
                />
              ))}
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
                "Adicionar"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
