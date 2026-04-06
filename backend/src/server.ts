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
 */

// IMPORTANTE: env.ts deve ser importado primeiro.
// Ele valida process.env e encerra o processo se houver erros.
import { env } from "./lib/env.js"

import Fastify from "fastify"
import cors from "@fastify/cors"
import helmet from "@fastify/helmet"

import { errorHandler } from "./middleware/errorHandler.js"
import { authRoutes } from "./routes/auth.js"

// ─── Logger ───────────────────────────────────────────────────────────────────
// pino-pretty é um pacote opcional — evitamos dependê-lo para não exigir
// instalação extra. Em desenvolvimento usamos o JSON formatado pelo próprio
// Pino com um serializer legível. Em produção, JSON puro (parseável por
// ferramentas de log como Datadog, Grafana Loki, etc.)
const loggerConfig =
  env.NODE_ENV === "development"
    ? {
        level: "info",
        // Serializer customizado: exibe timestamp e msg de forma legível
        // sem precisar do pino-pretty
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

// CORS: permite apenas o domínio do frontend configurado.
await fastify.register(cors, {
  origin: env.FRONTEND_URL,
  credentials: true,
})

// Helmet: headers de segurança HTTP automáticos.
await fastify.register(helmet, {
  contentSecurityPolicy: false, // API REST, não um site
})

// ─── Error Handler ────────────────────────────────────────────────────────────
fastify.setErrorHandler(errorHandler)

// ─── Rotas ────────────────────────────────────────────────────────────────────
fastify.get("/health", async () => ({
  status: "ok",
  timestamp: new Date().toISOString(),
  environment: env.NODE_ENV,
}))

await fastify.register(authRoutes)

// ─── Inicialização ────────────────────────────────────────────────────────────
try {
  await fastify.listen({ port: env.PORT, host: "0.0.0.0" })
  fastify.log.info(`🚀 Servidor rodando em http://localhost:${env.PORT}`)
  fastify.log.info(`📋 Health check: http://localhost:${env.PORT}/health`)
} catch (err) {
  fastify.log.error(err)
  process.exit(1)
}
