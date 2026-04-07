"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../ui/popover"

interface CategoryFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category?: {
    id: string
    name: string
    emoji: string
    color: string
  }
}

const emojis = [
  "💼", "💻", "🛒", "🚗", "🏠", "🎮", "🏥", "📚",
  "🛍️", "📺", "✈️", "🍔", "☕", "🎬", "🏋️", "💇",
  "🐾", "🎁", "💰", "📈", "🏦", "💳", "🔧", "📱",
]

const colors = [
  "#ef4444", "#f97316", "#eab308", "#22c55e",
  "#14b8a6", "#06b6d4", "#3b82f6", "#6366f1",
  "#8b5cf6", "#a855f7", "#d946ef", "#ec4899",
]

export function CategoryForm({
  open,
  onOpenChange,
  category,
}: CategoryFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: category?.name ?? "",
    emoji: category?.emoji ?? "📦",
    color: category?.color ?? colors[0],
  })

  const isEditing = !!category

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
            {isEditing ? "Editar Categoria" : "Nova Categoria"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Atualize os dados da categoria"
              : "Crie uma nova categoria para organizar suas transacoes"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-end gap-3">
            <div className="space-y-2">
              <Label>Icone</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-11 w-11 p-0 text-xl"
                    type="button"
                  >
                    {formData.emoji}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64" align="start">
                  <div className="grid grid-cols-8 gap-1">
                    {emojis.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        className={`p-2 text-lg rounded hover:bg-muted transition-colors ${
                          formData.emoji === emoji ? "bg-muted" : ""
                        }`}
                        onClick={() =>
                          setFormData({ ...formData, emoji })
                        }
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex-1 space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                placeholder="Ex: Alimentacao"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                className="h-11"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Cor</Label>
            <div className="flex flex-wrap gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`h-8 w-8 rounded-full transition-all ${
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

          <div className="pt-2">
            <Label className="text-muted-foreground text-xs">
              Pre-visualizacao
            </Label>
            <div className="mt-2 flex items-center gap-3 p-3 rounded-lg bg-muted">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full text-lg"
                style={{ backgroundColor: `${formData.color}20` }}
              >
                {formData.emoji}
              </div>
              <span className="font-medium">
                {formData.name || "Nome da categoria"}
              </span>
              <div
                className="ml-auto h-3 w-3 rounded-full"
                style={{ backgroundColor: formData.color }}
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
