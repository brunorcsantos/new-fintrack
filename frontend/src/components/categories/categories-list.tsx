"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { CategoryForm } from "./category-form"

interface Category {
  id: string
  name: string
  emoji: string
  color: string
  transactionCount: number
  totalAmount: number
}

interface CategoriesListProps {
  categories?: Category[]
  isLoading?: boolean
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

const mockCategories: Category[] = [
  {
    id: "1",
    name: "Salario",
    emoji: "💼",
    color: "#22c55e",
    transactionCount: 2,
    totalAmount: 17000,
  },
  {
    id: "2",
    name: "Freelance",
    emoji: "💻",
    color: "#3b82f6",
    transactionCount: 3,
    totalAmount: 4500,
  },
  {
    id: "3",
    name: "Alimentacao",
    emoji: "🛒",
    color: "#f97316",
    transactionCount: 15,
    totalAmount: 1850.45,
  },
  {
    id: "4",
    name: "Transporte",
    emoji: "🚗",
    color: "#eab308",
    transactionCount: 8,
    totalAmount: 520.3,
  },
  {
    id: "5",
    name: "Moradia",
    emoji: "🏠",
    color: "#8b5cf6",
    transactionCount: 3,
    totalAmount: 2850.0,
  },
  {
    id: "6",
    name: "Lazer",
    emoji: "🎮",
    color: "#ec4899",
    transactionCount: 5,
    totalAmount: 380.0,
  },
  {
    id: "7",
    name: "Assinaturas",
    emoji: "📺",
    color: "#06b6d4",
    transactionCount: 4,
    totalAmount: 120.7,
  },
  {
    id: "8",
    name: "Saude",
    emoji: "🏥",
    color: "#ef4444",
    transactionCount: 2,
    totalAmount: 450.0,
  },
]

export function CategoriesList({
  categories = mockCategories,
  isLoading,
}: CategoriesListProps) {
  const [editCategory, setEditCategory] = useState<Category | null>(null)

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Card key={category.id} className="group">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-full text-xl shrink-0"
                  style={{ backgroundColor: `${category.color}20` }}
                >
                  {category.emoji}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium truncate">{category.name}</h3>
                    <div
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: category.color }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {category.transactionCount} transacoes
                  </p>
                  <p className="text-sm font-medium mt-1">
                    {formatCurrency(category.totalAmount)}
                  </p>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Acoes</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => setEditCategory(category)}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <CategoryForm
        open={!!editCategory}
        onOpenChange={(open) => !open && setEditCategory(null)}
        category={
          editCategory
            ? {
                id: editCategory.id,
                name: editCategory.name,
                emoji: editCategory.emoji,
                color: editCategory.color,
              }
            : undefined
        }
      />
    </>
  )
}
