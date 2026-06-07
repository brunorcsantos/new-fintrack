"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { CategoryForm } from "./category-form";
import { useCategoriesContext } from "@/hooks/useCategoriesContext";
import { Category } from "@/types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function CategoriesList() {
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(
    null,
  );
  const [showCreateForm, setShowCreateForm] = useState(false)
  const { categories, isLoading, fetchCategories, deleteCategory, updateCategory } =
    useCategoriesContext();

  useEffect(() => {
    try {
      fetchCategories();
    } catch (error) {
      console.log("Erro");
    }
  }, []);

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
    );
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
                  {category.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium truncate">{category.name}</h3>
                    <div
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: category.color }}
                    />
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <div className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Acoes</span>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditCategory(category)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => setDeletingCategory(category)}
                    >
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
        onSave={async (data) => {
          await updateCategory(editCategory!.id, data);
          setEditCategory(null);
        }}
        category={
          editCategory
            ? {
                id: editCategory.id,
                name: editCategory.name,
                emoji: editCategory.icon,
                color: editCategory.color,
              }
            : undefined
        }
      />
      {deletingCategory && (
        <AlertDialog
          open={!!deletingCategory}
          onOpenChange={(open) => !open && setDeletingCategory(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir categoria</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir a categoria "
                {deletingCategory?.name}"? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive hover:bg-destructive/90"
                onClick={async () => {
                  await deleteCategory(deletingCategory!.id);
                  setDeletingCategory(null);
                }}
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
