/**
 * src/lib/prisma.ts
 *
 * Instância singleton do Prisma Client.
 *
 * Por que singleton? Cada instância do PrismaClient abre um pool de
 * conexões com o banco. Em desenvolvimento, o tsx (hot reload) re-executa
 * os módulos a cada mudança de arquivo. Sem o padrão de globalThis,
 * cada reload criaria uma nova instância — depois de algumas mudanças,
 * você esgotaria as conexões disponíveis do PostgreSQL.
 *
 * A variável global sobrevive ao hot reload porque não está dentro
 * do sistema de módulos do Node — ela persiste no objeto global do processo.
 *
 * Em produção, o singleton é criado uma única vez e reutilizado.
 */

import { PrismaClient } from "@prisma/client"
import { env } from "./env.js"

// Declara o tipo da variável global para satisfazer o TypeScript
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined
}

// Em desenvolvimento: reutiliza a instância existente no global.
// Em produção: sempre cria uma nova (não há hot reload).
export const prisma =
  global.__prisma ??
  new PrismaClient({
    log:
      env.NODE_ENV === "development"
        ? ["query", "warn", "error"] // loga todas as queries em dev
        : ["warn", "error"],         // só erros em produção
  })

// Salva no global apenas em desenvolvimento
if (env.NODE_ENV === "development") {
  global.__prisma = prisma
}
