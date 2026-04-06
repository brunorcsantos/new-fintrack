/**
 * src/lib/env.ts
 *
 * Valida TODAS as variáveis de ambiente no momento em que o servidor sobe.
 * Se qualquer variável estiver ausente ou inválida, o processo encerra
 * imediatamente com uma mensagem clara — princípio de "fail fast".
 *
 * Isso evita que o servidor suba aparentemente saudável e falhe apenas
 * na primeira requisição que tenta usar uma variável ausente.
 *
 * Como usar: importe este módulo no topo do server.ts, antes de qualquer
 * outra importação que dependa de process.env.
 *   import { env } from "./lib/env"
 */

import { z } from "zod"
import "dotenv/config"

// O schema descreve o contrato de configuração da aplicação.
// Cada campo tem seu tipo e restrições explícitas.
const envSchema = z.object({
  // Banco
  DATABASE_URL: z
    .string()
    .url("DATABASE_URL deve ser uma URL válida")
    .startsWith("postgresql://", "DATABASE_URL deve começar com postgresql://"),

  // JWT
  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET deve ter pelo menos 32 caracteres"),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, "JWT_REFRESH_SECRET deve ter pelo menos 32 caracteres"),

  // Servidor
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z
    .string()
    .transform(Number)
    .pipe(z.number().int().min(1024).max(65535))
    .default("3333"),
  FRONTEND_URL: z.string().url("FRONTEND_URL deve ser uma URL válida"),

  // OAuth Google (opcionais — só exigidos se o provedor estiver habilitado)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_REDIRECT_URI: z.string().url().optional(),

  // OAuth GitHub (opcionais)
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  GITHUB_REDIRECT_URI: z.string().url().optional(),

  // Rate limiting (opcionais com defaults)
  RATE_LIMIT_MAX: z
    .string()
    .transform(Number)
    .pipe(z.number().int().positive())
    .default("100"),
  RATE_LIMIT_WINDOW_MS: z
    .string()
    .transform(Number)
    .pipe(z.number().int().positive())
    .default("60000"),
  AUTH_RATE_LIMIT_MAX: z
    .string()
    .transform(Number)
    .pipe(z.number().int().positive())
    .default("10"),
  AUTH_RATE_LIMIT_WINDOW_MS: z
    .string()
    .transform(Number)
    .pipe(z.number().int().positive())
    .default("900000"),
})

// Tenta parsear process.env usando o schema acima.
// Se falhar, formata os erros e encerra o processo.
const result = envSchema.safeParse(process.env)

if (!result.success) {
  console.error("\n❌ Erro de configuração — variáveis de ambiente inválidas:\n")

  // Formata cada erro em uma linha legível
  const errors = result.error.flatten().fieldErrors
  for (const [field, messages] of Object.entries(errors)) {
    console.error(`  ${field}: ${messages?.join(", ")}`)
  }

  console.error(
    "\nCopie o .env.example para .env e preencha as variáveis obrigatórias.\n"
  )

  process.exit(1)
}

// Exporta as variáveis validadas e tipadas.
// Em qualquer parte do código, ao importar `env`, você tem:
// - Tipos corretos (PORT é number, não string)
// - Garantia de que os valores existem e são válidos
export const env = result.data
