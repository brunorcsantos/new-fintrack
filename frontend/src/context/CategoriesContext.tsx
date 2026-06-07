import { useCategories, UseCategoriesReturn } from "@/hooks/useCategories";
import { createContext, ReactNode, useContext, useState } from "react";

type CategoryContextValue = UseCategoriesReturn;

export const CategoriesContext = createContext<CategoryContextValue | null>(null);

export function CategoriesProvider({ children }: { children: ReactNode }) {
  const categories = useCategories();

  return (
    <CategoriesContext.Provider value={categories}>
      {children}
    </CategoriesContext.Provider>
  );
}

