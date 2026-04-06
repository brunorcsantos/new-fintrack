/**
 * prisma/seed.ts
 *
 * Este arquivo NÃO é chamado diretamente pelo Prisma como seed automático.
 * Ele exporta a função `seedDefaultCategories` que é chamada dentro de
 * uma prisma.$transaction no momento do registro do usuário (src/routes/auth.ts).
 *
 * Isso garante atomicidade: se qualquer INSERT falhar, o usuário não é criado.
 *
 * Para popular um usuário existente manualmente durante desenvolvimento:
 *   npx tsx prisma/seed.ts <email-do-usuario>
 */

import { PrismaClient } from "@prisma/client"
import { fileURLToPath } from "url"

// Tipo auxiliar para descrever a estrutura das categorias padrão
type DefaultCategory = {
  slug: string
  name: string
  icon: string
  color: string
  subcategories: Array<{ slug: string; name: string; icon: string }>
}

// Categorias padrão que todo usuário novo recebe ao se cadastrar.
// A ordem importa para a exibição na UI.
export const DEFAULT_CATEGORIES: DefaultCategory[] = [
  {
    slug: "moradia",
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
    slug: "alimentacao",
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
    slug: "transporte",
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
    slug: "saude",
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
    slug: "lazer",
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
    slug: "cartao-credito",
    name: "Cartão de Crédito",
    icon: "💳",
    color: "#E8C45A",
    subcategories: [
      { slug: "fatura-mensal", name: "Fatura Mensal", icon: "📄" },
      { slug: "parcelas", name: "Parcelas", icon: "🔢" },
    ],
  },
  {
    slug: "receita",
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
        slug: cat.slug,
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

// ─── Execução manual via CLI ──────────────────────────────────────────────────
// Permite rodar: npx tsx prisma/seed.ts email@exemplo.com
// Útil para popular categorias em um usuário existente durante desenvolvimento.
async function main() {
  const email = process.argv[2]

  if (!email) {
    console.error("Uso: npx tsx prisma/seed.ts <email-do-usuario>")
    process.exit(1)
  }

  const prisma = new PrismaClient()

  try {
    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      console.error(`Usuário com email "${email}" não encontrado.`)
      process.exit(1)
    }

    console.log(`Criando categorias padrão para ${user.name} (${user.email})...`)

    const ops = buildSeedOperations(prisma, user.id)
    await prisma.$transaction(ops)

    console.log(`✓ ${DEFAULT_CATEGORIES.length} categorias criadas com sucesso.`)
  } catch (err) {
    console.error("Erro ao criar categorias:", err)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Só executa o main se chamado diretamente (não quando importado por auth.ts)
// ESM: import.meta.url é o equivalente de require.main === module no CJS
const isMain = process.argv[1] === fileURLToPath(import.meta.url)
if (isMain) {
  main()
}
