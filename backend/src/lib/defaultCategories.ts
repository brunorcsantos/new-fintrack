import { PrismaClient } from "@prisma/client"

export type DefaultCategory = {
  name: string
  icon: string
  color: string
  subcategories: Array<{ slug: string; name: string; icon: string }>
}

export const DEFAULT_CATEGORIES: DefaultCategory[] = [
  {
    name: "Moradia",
    icon: "🏠",
    color: "#E8845A",
    subcategories: [
      { slug: "aluguel", name: "Aluguel", icon: "🔑" },
      { slug: "energia", name: "Energia", icon: "⚡" },
      { slug: "agua", name: "Água", icon: "💧" },
      { slug: "internet", name: "Internet", icon: "📡" },
      { slug: "condominio", name: "Condomínio", icon: "🏢" },
    ],
  },
  {
    name: "Alimentação",
    icon: "🍽️",
    color: "#5AB88A",
    subcategories: [
      { slug: "supermercado", name: "Supermercado", icon: "🛒" },
      { slug: "restaurante", name: "Restaurante", icon: "🍴" },
      { slug: "delivery", name: "Delivery", icon: "🛵" },
      { slug: "padaria", name: "Padaria", icon: "🥐" },
    ],
  },
  {
    name: "Transporte",
    icon: "🚗",
    color: "#5A8FE8",
    subcategories: [
      { slug: "combustivel", name: "Combustível", icon: "⛽" },
      { slug: "uber", name: "Uber/99", icon: "🚕" },
      { slug: "manutencao", name: "Manutenção", icon: "🔧" },
      { slug: "transporte-publico", name: "Transporte Público", icon: "🚌" },
    ],
  },
  {
    name: "Saúde",
    icon: "❤️",
    color: "#E85A7A",
    subcategories: [
      { slug: "plano-saude", name: "Plano de Saúde", icon: "🏥" },
      { slug: "medicamentos", name: "Medicamentos", icon: "💊" },
      { slug: "consultas", name: "Consultas", icon: "👨‍⚕️" },
      { slug: "academia", name: "Academia", icon: "💪" },
    ],
  },
  {
    name: "Lazer",
    icon: "🎭",
    color: "#A85AE8",
    subcategories: [
      { slug: "streaming", name: "Streaming", icon: "📺" },
      { slug: "cinema", name: "Cinema", icon: "🎬" },
      { slug: "viagens", name: "Viagens", icon: "✈️" },
      { slug: "hobbies", name: "Hobbies", icon: "🎮" },
    ],
  },
  {
    name: "Cartão de Crédito",
    icon: "💳",
    color: "#E8C45A",
    subcategories: [
      { slug: "fatura-mensal", name: "Fatura Mensal", icon: "📄" },
      { slug: "parcelas", name: "Parcelas", icon: "🔢" },
    ],
  },
  {
    name: "Receita",
    icon: "💰",
    color: "#4CAF50",
    subcategories: [
      { slug: "salario", name: "Salário", icon: "💼" },
      { slug: "freelance", name: "Freelance", icon: "💻" },
      { slug: "investimentos", name: "Investimentos", icon: "📈" },
    ],
  },
]


/**
 * Cria as categorias e subcategorias padrão para um usuário.
 *
 * Esta função retorna um ARRAY de operações Prisma (não executa diretamente).
 * O chamador deve incluir essas operações dentro de um prisma.$transaction([...])
 * junto com a criação do usuário, garantindo atomicidade total.
 *
 * Exemplo de uso em auth.ts:
 *   const user = prisma.user.create({ data: { ... } })
 *   const categoryOps = buildSeedOperations(userId)
 *   await prisma.$transaction([user, ...categoryOps])
 */
export function buildSeedOperations(prisma: PrismaClient, userId: string) {
  const operations = []

  for (const cat of DEFAULT_CATEGORIES) {
    // Cria a categoria principal
    const categoryCreate = prisma.category.create({
      data: {
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        userId,
        subcategories: {
          // Usa um nested create para criar todas as subcategorias
          // junto com a categoria em uma única operação SQL
          create: cat.subcategories.map((sub) => ({
            slug: sub.slug,
            name: sub.name,
            icon: sub.icon,
          })),
        },
      },
    })

    operations.push(categoryCreate)
  }

  return operations
}