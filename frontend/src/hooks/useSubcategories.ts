import { api } from "@/lib/api";
import { Subcategory } from "@/types";
import { useCallback, useState } from "react";

export type CreateSubcategoryData = {
  name: string;
  icon: string;
  categoryId: string;
};

export type UseSubcategoriesReturn = {
  subcategories: Subcategory[];
  isLoading: boolean;
  error: string | null;
  createSubcategory: (data: CreateSubcategoryData) => Promise<Subcategory>;
  fetchSubcategories: (categoryId: string) => Promise<void>;
  updateSubcategory: (
    id: string,
    categoryId: string,
    data: Partial<CreateSubcategoryData>,
  ) => Promise<Subcategory>;
  deleteSubcategory: (id: string, categoryId: string) => Promise<void>;
};

export function useSubcategories(): UseSubcategoriesReturn {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSubcategories = useCallback(async (categoryId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await api.get<Subcategory[]>(
        `/categories/${categoryId}/subcategories`,
      );
      setSubcategories(result);
    } catch (err: any) {
      setError(err.message ?? "Erro ao carregar subcategorias.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createSubcategory = useCallback(
    async (data: CreateSubcategoryData): Promise<Subcategory> => {
      const created = await api.post<Subcategory>(
        `/categories/${data.categoryId}/subcategories`,
        data,
      );
      setSubcategories((prev) =>
        [...prev, created].sort((a, b) => a.name.localeCompare(b.name)),
      );
      return created;
    },
    [],
  );

  const updateSubcategory = useCallback(
    async (
      id: string,
      categoryId: string,
      data: Partial<CreateSubcategoryData>,
    ): Promise<Subcategory> => {
      const updated = await api.put<Subcategory>(
        `/categories/${categoryId}/subcategories/${id}`,
        data,
      );
      setSubcategories((prev) =>
        prev.map((cat) => (cat.id === id ? updated : cat)),
      );
      return updated;
    },
    [],
  );

  const deleteSubcategory = useCallback(
    async (id: string, categoryId: string): Promise<void> => {
      await api.delete(`/categories/${categoryId}/subcategories/${id}`);
      setSubcategories((prev) => prev.filter((cat) => cat.id !== id));
    },
    [],
  );

  return {
    subcategories,
    isLoading,
    error,
    fetchSubcategories,
    createSubcategory,
    updateSubcategory,
    deleteSubcategory,
  };
}

export default useSubcategories;
