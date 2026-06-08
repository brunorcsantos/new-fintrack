/**
 * src/services/subcategories.ts
 *
 * Lógica de negócio para subcategorias.
 *
 * REGRAS DE NEGÓCIO IMPORTANTES:
 *
 * 1. OWNERSHIP: todo acesso filtra por userId — vem do JWT, nunca do body.
 *    Isso implementa o princípio anti-IDOR descrito no plano.
 *
 * 2. SOFT DELETE: categorias nunca são deletadas fisicamente. O campo
 *    `deletedAt` é preenchido. Todas as queries incluem `deletedAt: null`.
 *    Isso evita perda acidental e mantém integridade dos dados históricos.
 *
 * 3. PROTEÇÃO CONTRA EXCLUSÃO: categorias com transações vinculadas não
 *    podem ser deletadas. O frontend recebe erro semântico CATEGORY_IN_USE.
 *
 */

import { prisma } from "../lib/prisma.js";

export type CreateSubcategoryInput = {
  name: string;
  icon: string;
};

export type UpdateSubcategoryInput = Partial<CreateSubcategoryInput>;

export async function listSubcategories(categoryId: string) {
  return prisma.subcategory.findMany({
    where: {
      categoryId,
      deletedAt: null,
    },
    orderBy: { name: "asc" },
  });
}

export async function getSubcategoryById(id: string, categoryId: string) {
  return prisma.subcategory.findFirst({
    where: {
      id,
      categoryId, // OBRIGATÓRIO: dupla verificação de ownership
      deletedAt: null,
    },
  });
}

export async function createSubcategory(
  categoryId: string,
  input: CreateSubcategoryInput,
) {
  return prisma.subcategory.create({
    data: {
      name: input.name,
      icon: input.icon,
      categoryId: categoryId,
    },
  });
}

export async function updateSubcategory(
  id: string,
  categoryId: string,
  input: UpdateSubcategoryInput,
) {
  const existing = await getSubcategoryById(id, categoryId);
  if (!existing) {
    const error = new Error("Subcategoria não encontrada.") as any;
    error.code = "NOT_FOUND";
    error.statusCode = 404;
    throw error;
  }

  return prisma.subcategory.update({
    where: { id },
    data: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.icon !== undefined && { icon: input.icon }),
    },
  });
}

export async function deleteSubcategory(
  id: string,
  categoryId: string,
  userId: string,
) {
  const existing = await getSubcategoryById(id, categoryId);
  if (!existing) {
    const error = new Error("Subcategoria não encontrada.") as any;
    error.code = "NOT_FOUND";
    error.statusCode = 404;
    throw error;
  }

  const transactionCount = await prisma.transaction.count({
    where: {
      subcategoryId: id,
      categoryId: categoryId,
      userId,
      deletedAt: null, // ignora transações já removidas
    },
  });

  if (transactionCount > 0) {
    const error = new Error(
      `Subcategoria possui ${transactionCount} lançamento(s) vinculado(s). Remova-os primeiro ou altere a categoria/subcategoria dos lançamentos.`,
    ) as any;
    error.code = "SUBCATEGORY_IN_USE";
    error.statusCode = 409;
    throw error;
  }

  return prisma.subcategory.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}
