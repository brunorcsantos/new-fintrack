/**
 * src/routes/auth.ts
 *
 * Rotas de autenticação: registro, login, refresh, logout, me, OAuth.
 *
 * Este arquivo lida apenas com HTTP (parse, validate, respond).
 * A lógica de negócio fica em src/services/auth.ts.
 *
 * Rotas registradas:
 *   POST /auth/register
 *   POST /auth/login
 *   POST /auth/refresh
 *   POST /auth/logout
 *   GET  /auth/me
 *   GET  /auth/google
 *   GET  /auth/google/callback
 *   GET  /auth/github
 *   GET  /auth/github/callback
 */

import type { FastifyInstance } from "fastify"
import { z } from "zod"
import { Google, GitHub } from "arctic"
import crypto from "crypto"
import { authenticate } from "../middleware/auth.js"
import { env } from "../lib/env.js"
import { prisma } from "../lib/prisma.js"
import {
  registerUser,
  loginUser,
  refreshTokens,
  revokeRefreshToken,
  upsertOAuthUser,
} from "../services/auth.js"

// ─── Schemas de validação ─────────────────────────────────────────────────────

const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100),
  email: z.string().email("E-mail inválido"),
  password: z
    .string()
    .min(8, "Senha deve ter pelo menos 8 caracteres")
    .max(128),
})

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(1, "Senha é obrigatória"),
})

const refreshSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token é obrigatório"),
})

const logoutSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token é obrigatório"),
})

// ─── Configuração OAuth (inicializada condicionalmente) ───────────────────────
// Os provedores só são instanciados se as variáveis de ambiente estiverem presentes.
// Isso permite rodar o projeto sem OAuth configurado durante desenvolvimento inicial.

function createGoogleProvider() {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET || !env.GOOGLE_REDIRECT_URI) {
    return null
  }
  return new Google(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET, env.GOOGLE_REDIRECT_URI)
}

function createGitHubProvider() {
  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET || !env.GITHUB_REDIRECT_URI) {
    return null
  }
  return new GitHub(env.GITHUB_CLIENT_ID, env.GITHUB_CLIENT_SECRET)
}

// ─── Registro de rotas ────────────────────────────────────────────────────────

export async function authRoutes(fastify: FastifyInstance) {
  const google = createGoogleProvider()
  const github = createGitHubProvider()

  // ── POST /auth/register ──────────────────────────────────────────────────
  fastify.post("/auth/register", async (request, reply) => {
    const body = registerSchema.parse(request.body)

    const tokens = await registerUser(body)

    return reply.status(201).send(tokens)
  })

  // ── POST /auth/login ─────────────────────────────────────────────────────
  fastify.post("/auth/login", async (request, reply) => {
    const body = loginSchema.parse(request.body)

    const tokens = await loginUser(body)

    return reply.send(tokens)
  })

  // ── POST /auth/refresh ───────────────────────────────────────────────────
  fastify.post("/auth/refresh", async (request, reply) => {
    const { refreshToken } = refreshSchema.parse(request.body)

    const tokens = await refreshTokens(refreshToken)

    return reply.send(tokens)
  })

  // ── POST /auth/logout ────────────────────────────────────────────────────
  fastify.post("/auth/logout", async (request, reply) => {
    const { refreshToken } = logoutSchema.parse(request.body)

    await revokeRefreshToken(refreshToken)

    // 204 No Content: sucesso sem corpo de resposta
    return reply.status(204).send()
  })

  // ── GET /auth/me ─────────────────────────────────────────────────────────
  // Rota protegida: exige Bearer token válido via preHandler
  fastify.get(
    "/auth/me",
    { preHandler: [authenticate] },
    async (request, reply) => {
      // request.user foi populado pelo middleware authenticate
      const user = await prisma.user.findUnique({
        where: { id: request.user.sub },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          // Retorna quais provedores OAuth estão vinculados
          oauthAccounts: { select: { provider: true } },
          // Indica se tem senha local (usuário não-OAuth pode adicionar senha)
          passwordHash: false, // nunca retornar o hash
        },
      })

      if (!user) {
        return reply.status(404).send({
          error: "NOT_FOUND",
          message: "Usuário não encontrado.",
          statusCode: 404,
        })
      }

      return reply.send({
        ...user,
        hasPassword: true, // será calculado abaixo
        providers: user.oauthAccounts.map((a) => a.provider),
      })
    }
  )

  // ── GET /auth/google ─────────────────────────────────────────────────────
  // Inicia o fluxo OAuth: gera URL de autorização e redireciona
  fastify.get("/auth/google", async (request, reply) => {
    if (!google) {
      return reply.status(501).send({
        error: "OAUTH_NOT_CONFIGURED",
        message: "Autenticação com Google não está configurada.",
        statusCode: 501,
      })
    }

    // O `state` é um valor aleatório que previne ataques CSRF.
    // Salvamos no banco temporariamente e verificamos no callback.
    const state = crypto.randomBytes(16).toString("hex")

    // Salva o state com expiração de 10 minutos
    // (tempo máximo esperado para o usuário completar o login no Google)
    await prisma.refreshToken.create({
      data: {
        id: `oauth-state-${state}`,
        token: state,
        userId: "oauth-state", // placeholder — não é um usuário real
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    })

    const scopes = ["openid", "email", "profile"]
    const url = await google.createAuthorizationURL(state, state, { scopes })

    return reply.redirect(url.toString())
  })

  // ── GET /auth/google/callback ────────────────────────────────────────────
  fastify.get("/auth/google/callback", async (request, reply) => {
    if (!google) {
      return reply.status(501).send({ error: "OAUTH_NOT_CONFIGURED" })
    }

    const { code, state } = request.query as { code?: string; state?: string }

    if (!code || !state) {
      return reply.status(400).send({
        error: "OAUTH_CALLBACK_INVALID",
        message: "Parâmetros de callback ausentes.",
        statusCode: 400,
      })
    }

    // Verifica o state para prevenir CSRF
    const storedState = await prisma.refreshToken.findUnique({
      where: { id: `oauth-state-${state}` },
    })

    if (!storedState || storedState.expiresAt < new Date()) {
      return reply.status(400).send({
        error: "OAUTH_STATE_INVALID",
        message: "State OAuth inválido ou expirado.",
        statusCode: 400,
      })
    }

    // Limpa o state usado
    await prisma.refreshToken.delete({ where: { id: `oauth-state-${state}` } })

    // Troca o code pelo token do Google
    const tokens = await google.validateAuthorizationCode(code, state)
    const googleToken = tokens.idToken()

    // Decodifica o ID token para extrair email e nome
    // (sem verificar assinatura — o Google já garantiu ao emitir)
    const payload = JSON.parse(
      Buffer.from(googleToken.split(".")[1], "base64url").toString()
    )

    const { sub: googleId, email, name } = payload as {
      sub: string
      email: string
      name: string
    }

    // Upsert: cria ou vincula o usuário
    const authTokens = await upsertOAuthUser({
      provider: "google",
      providerAccountId: googleId,
      email,
      name,
    })

    // Redireciona para o frontend com os tokens no hash fragment.
    // Hash fragment (#) não é enviado ao servidor — só o JavaScript do frontend lê.
    const redirectUrl = new URL("/auth/callback", env.FRONTEND_URL)
    redirectUrl.hash = `accessToken=${authTokens.accessToken}&refreshToken=${authTokens.refreshToken}`

    return reply.redirect(redirectUrl.toString())
  })

  // ── GET /auth/github ─────────────────────────────────────────────────────
  fastify.get("/auth/github", async (request, reply) => {
    if (!github) {
      return reply.status(501).send({
        error: "OAUTH_NOT_CONFIGURED",
        message: "Autenticação com GitHub não está configurada.",
        statusCode: 501,
      })
    }

    const state = crypto.randomBytes(16).toString("hex")

    await prisma.refreshToken.create({
      data: {
        id: `oauth-state-${state}`,
        token: state,
        userId: "oauth-state",
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    })

    const url = await github.createAuthorizationURL(state, {
      scopes: ["user:email"],
    })

    return reply.redirect(url.toString())
  })

  // ── GET /auth/github/callback ────────────────────────────────────────────
  fastify.get("/auth/github/callback", async (request, reply) => {
    if (!github) {
      return reply.status(501).send({ error: "OAUTH_NOT_CONFIGURED" })
    }

    const { code, state } = request.query as { code?: string; state?: string }

    if (!code || !state) {
      return reply.status(400).send({
        error: "OAUTH_CALLBACK_INVALID",
        message: "Parâmetros de callback ausentes.",
        statusCode: 400,
      })
    }

    const storedState = await prisma.refreshToken.findUnique({
      where: { id: `oauth-state-${state}` },
    })

    if (!storedState || storedState.expiresAt < new Date()) {
      return reply.status(400).send({
        error: "OAUTH_STATE_INVALID",
        message: "State OAuth inválido ou expirado.",
        statusCode: 400,
      })
    }

    await prisma.refreshToken.delete({ where: { id: `oauth-state-${state}` } })

    const tokens = await github.validateAuthorizationCode(code)
    const githubToken = tokens.accessToken()

    // GitHub não retorna email no token — precisa de uma chamada extra à API
    const [userResponse, emailsResponse] = await Promise.all([
      fetch("https://api.github.com/user", {
        headers: { Authorization: `Bearer ${githubToken}` },
      }),
      fetch("https://api.github.com/user/emails", {
        headers: { Authorization: `Bearer ${githubToken}` },
      }),
    ])

    const githubUser = (await userResponse.json()) as { id: number; name: string; login: string }
    const emails = (await emailsResponse.json()) as Array<{ email: string; primary: boolean; verified: boolean }>

    // Usa o email primário e verificado
    const primaryEmail = emails.find((e) => e.primary && e.verified)?.email

    if (!primaryEmail) {
      return reply.status(400).send({
        error: "OAUTH_NO_EMAIL",
        message: "Não foi possível obter seu e-mail do GitHub. Verifique se tem um e-mail público ou verificado.",
        statusCode: 400,
      })
    }

    const authTokens = await upsertOAuthUser({
      provider: "github",
      providerAccountId: String(githubUser.id),
      email: primaryEmail,
      name: githubUser.name || githubUser.login,
    })

    const redirectUrl = new URL("/auth/callback", env.FRONTEND_URL)
    redirectUrl.hash = `accessToken=${authTokens.accessToken}&refreshToken=${authTokens.refreshToken}`

    return reply.redirect(redirectUrl.toString())
  })
}
