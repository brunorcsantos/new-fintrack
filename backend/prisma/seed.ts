import { buildSeedOperations, DEFAULT_CATEGORIES } from "../src/lib/defaultCategories"

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


// Categorias padrão que todo usuário novo recebe ao se cadastrar.
// A ordem importa para a exibição na UI.




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
