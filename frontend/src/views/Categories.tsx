"use client";

import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { CategoriesList } from "@/components/categories/categories-list";
import { CategoryForm } from "@/components/categories/category-form";
import { useCategoriesContext } from "@/hooks/useCategoriesContext";

export default function CategoriesPage() {
  const [showForm, setShowForm] = useState(false);

  const { createCategory } = useCategoriesContext();

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
        <CategoriesList />
      </main>

      <CategoryForm
        onSave={async (data) => {
          await createCategory(data);
          setShowForm(false);
        }}
        open={showForm}
        onOpenChange={setShowForm}
      />
    </div>
  );
}
