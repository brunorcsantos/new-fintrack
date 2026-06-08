import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { useSubcategories } from "@/hooks/useSubcategories";
import { SubcategoryForm } from "./subcategory-form";
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
import type { Category, Subcategory } from "@/types";
import { DialogDescription } from "@radix-ui/react-dialog";
import { Card, CardContent } from "../ui/card";

interface CategoryDetailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category | null;
}

export function CategoryDetail({
  open,
  onOpenChange,
  category,
}: CategoryDetailProps) {
  const [showSubcategoryForm, setShowSubcategoryForm] = useState(false);
  const [editingSubcategory, setEditingSubcategory] =
    useState<Subcategory | null>(null);
  const [deletingSubcategory, setDeletingSubcategory] =
    useState<Subcategory | null>(null);

  const {
    subcategories,
    isLoading,
    fetchSubcategories,
    createSubcategory,
    updateSubcategory,
    deleteSubcategory,
  } = useSubcategories();

  useEffect(() => {
    if (open && category) {
      fetchSubcategories(category.id);
    }
     
  }, [open, category]);

  if (!category) return null;

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="border-none shadow-none">
                  <CardContent className="p-1">
                    <div className="flex items-start gap-3 ">
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
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            {/* cabeçalho com ícone, nome e cor da categoria */}
            <div className="flex items-center gap-3">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full text-xl shrink-0"
                style={{ backgroundColor: `${category.color}20` }}
              >
                {category.icon}
              </div>
              <DialogTitle>{category.name}</DialogTitle>
            </div>
          </DialogHeader>

          {/* lista de subcategorias */}
          {subcategories.map((subcategory) => (
            <div
              key={subcategory.id}
              className="flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full text-xl shrink-0">
                  {subcategory.icon}
                </div>
                <span className="font-medium">{subcategory.name}</span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <div className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Acoes</span>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingSubcategory(subcategory);
                    }}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletingSubcategory(subcategory);
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}

          {/* AlertDialog para confirmar exclusão */}
          {deletingSubcategory && (
            <AlertDialog
              open={!!deletingSubcategory}
              onOpenChange={(open) => !open && setDeletingSubcategory(null)}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir categoria</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja excluir a subcategoria "
                    {deletingSubcategory?.name}"? Esta ação não pode ser
                    desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive hover:bg-destructive/90"
                    onClick={async () => {
                      await deleteSubcategory(
                        deletingSubcategory!.id,
                        category.id,
                      );
                      setDeletingSubcategory(null);
                    }}
                  >
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          {/* SubcategoryForm para editar */}
          <SubcategoryForm
            open={!!editingSubcategory}
            onOpenChange={(open) => !open && setEditingSubcategory(null)}
            onSave={async (data) => {
              await updateSubcategory(
                editingSubcategory!.id,
                category.id,
                data,
              );
            }}
            subcategory={
              editingSubcategory
                ? {
                    id: editingSubcategory.id,
                    name: editingSubcategory.name,
                    emoji: editingSubcategory.icon,
                  }
                : undefined
            }
          />
          {/* SubcategoryForm para criar */}
          <SubcategoryForm
            open={showSubcategoryForm}
            onOpenChange={setShowSubcategoryForm}
            onSave={async (data) => {
              await createSubcategory({ ...data, categoryId: category.id });
              setShowSubcategoryForm(false);
            }}
          />

          <Button onClick={() => setShowSubcategoryForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Criar
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
