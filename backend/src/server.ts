/**
 * src/server.ts
 *
 * Ponto de entrada da aplicação.
 *
 * Ordem de inicialização (importa):
 * 1. env.ts (validação de variáveis — falha rápida se algo errado)
 * 2. Plugins do Fastify (cors, helmet)
 * 3. Error handler global
 * 4. Rotas
 * 5. Listen
 *
 * FASE 2 ADICIONADO:
 * - categoriesRoutes: CRUD de categorias
 * - transactionsRoutes: CRUD de transações + summary
 */

// IMPORTANTE: env.ts deve ser importado primeiro.
// Ele valida process.env e encerra o processo se houver erros.
import { env } from "./lib/env.js"

import Fastify from "fastify"
import cors from "@fastify/cors"
import helmet from "@fastify/helmet"

import { errorHandler } from "./middleware/errorHandler.js"
import { authRoutes } from "./routes/auth.js"
import { categoriesRoutes } from "./routes/categories.js"
import { transactionsRoutes } from "./routes/transactions.js"

// ─── Logger ───────────────────────────────────────────────────────────────────
const loggerConfig =
  env.NODE_ENV === "development"
    ? {
        level: "info",
        serializers: {
          req(req: { method: string; url: string }) {
            return { method: req.method, url: req.url }
          },
        },
      }
    : { level: "info" }

// ─── Instância do Fastify ─────────────────────────────────────────────────────
const fastify = Fastify({ logger: loggerConfig })

// ─── Plugins ──────────────────────────────────────────────────────────────────

await fastify.register(cors, {
  origin: env.FRONTEND_URL,
  credentials: true,
})

await fastify.register(helmet, {
  contentSecurityPolicy: false,
})

// ─── Error Handler ────────────────────────────────────────────────────────────
fastify.setErrorHandler(errorHandler)

// ─── Rotas ────────────────────────────────────────────────────────────────────
fastify.get("/health", async () => ({
  status: "ok",
  timestamp: new Date().toISOString(),
  environment: env.NODE_ENV,
}))

// Fase 1: autenticação
await fastify.register(authRoutes)

// Fase 2: core financeiro
await fastify.register(categoriesRoutes)
await fastify.register(transactionsRoutes)

// ─── Inicialização ────────────────────────────────────────────────────────────
try {
  await fastify.listen({ port: env.PORT, host: "0.0.0.0" })
  fastify.log.info(`🚀 Servidor rodando em http://localhost:${env.PORT}`)
  fastify.log.info(`📋 Health check: http://localhost:${env.PORT}/health`)
} catch (err) {
  fastify.log.error(err)
  process.exit(1)
}
