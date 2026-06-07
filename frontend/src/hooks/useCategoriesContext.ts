import { useContext } from "react";
import { UseCategoriesReturn } from "./useCategories";
import { CategoriesContext } from "@/context/CategoriesContext";

export function useCategoriesContext(): UseCategoriesReturn {
  const ctx = useContext(CategoriesContext);
  if (!ctx)
    throw new Error(
      "useCategoriesContext deve ser usado dentro de <CategoriesProvider>",
    );
  return ctx;
}