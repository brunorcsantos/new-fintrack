"use client"

import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { CategoriesList } from "@/components/categories/categories-list"
import { CategoryForm } from "@/components/categories/category-form"

export default function CategoriesPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="flex flex-col min-h-screen">
      <DashboardHeader
        title="Categorias"
        description="Organize suas transacoes por categorias"
        action={{
          label: "Nova Categoria",
          onClick: () => setShowForm(true),
        }}
      />

      <main className="flex-1 p-4 md:p-6">
        <CategoriesList isLoading={isLoading} />
      </main>

      <CategoryForm open={showForm} onOpenChange={setShowForm} />
    </div>
  )
}
