/**
 * src/services/auth.ts
 *
 * Lógica de negócio de autenticação — separada das rotas intencionalmente.
 *
 * As rotas (src/routes/auth.ts) lidam com HTTP: parsear request, validar schema,
 * formatar response. Este arquivo lida com o "o que fazer": criação de usuário,
 * verificação de credenciais, emissão de tokens, rotação de refresh token.
 *
 * Essa separação torna a lógica testável sem precisar simular requests HTTP.
 */

import bcrypt from "bcryptjs"
import { prisma } from "../lib/prisma.js"
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  refreshTokenExpiresAt,
} from "../lib/tokens.js"
import { buildSeedOperations } from "../lib/defaultCategories.js"
import crypto from "crypto"

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type RegisterInput = {
  name: string
  email: string
  password: string
}

export type LoginInput = {
  email: string
  password: string
}

export type TokenPair = {
  accessToken: string
  refreshToken: string
}

// ─── Helpers privados ─────────────────────────────────────────────────────────

/**
 * Emite um par de tokens (access + refresh) para um usuário.
 * Persiste o refresh token no banco para controle de rotação.
 * Chamada após register, login, ou qualquer fluxo OAuth.
 */
async function issueTokens(userId: string, email: string, name: string): Promise<TokenPair> {
  // Gera um ID único para este refresh token (o "jti" — JWT ID)
  const jti = crypto.randomUUID()

  const accessToken = signAccessToken({ sub: userId, email, name })
  const refreshToken = signRefreshToken({ sub: userId, jti })

  // Persiste o refresh token no banco
  await prisma.refreshToken.create({
    data: {
      id: jti,      // o ID do registro É o jti do JWT — isso permite buscar pelo token
      token: refreshToken,
      userId,
      expiresAt: refreshTokenExpiresAt(),
    },
  })

  return { accessToken, refreshToken }
}

// ─── Operações públicas ───────────────────────────────────────────────────────

/**
 * Registra um novo usuário e cria suas categorias padrão.
 *
 * Usa prisma.$transaction para garantir atomicidade:
 * se qualquer operação falhar (ex: email duplicado, erro de banco),
 * nenhuma das mudanças é persistida — nem o usuário, nem as categorias.
 */
export async function registerUser(input: RegisterInput): Promise<TokenPair> {
  // Verifica se o email já existe antes de tentar inserir
  // (mais amigável que deixar o banco retornar erro de unique constraint)
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true },
  })

  if (existing) {
    const error = new Error("Email já cadastrado.") as any
    error.code = "EMAIL_ALREADY_EXISTS"
    error.statusCode = 409
    throw error
  }

  // bcrypt com 12 rounds: ~250ms por hash (imperceptível para o usuário,
  // mas significa que um atacante leva 250ms por tentativa de brute force)
  const passwordHash = await bcrypt.hash(input.password, 12)

  // Cria o usuário com ID gerado antecipadamente para usar no seed
  const userId = crypto.randomUUID()

  // buildSeedOperations retorna um array de prisma.category.create(...)
  // Todos são executados atomicamente junto com a criação do usuário
  const seedOps = buildSeedOperations(prisma, userId)

  await prisma.$transaction([
    prisma.user.create({
      data: {
        id: userId,
        name: input.name,
        email: input.email,
        passwordHash,
      },
    }),
    ...seedOps,
  ])

  return issueTokens(userId, input.email, input.name)
}

/**
 * Autentica um usuário com email e senha.
 * Retorna um par de tokens em caso de sucesso.
 *
 * Atenção: o erro retornado é intencionalmente genérico ("Credenciais inválidas")
 * para não revelar se o email existe ou não no sistema (user enumeration attack).
 */
export async function loginUser(input: LoginInput): Promise<TokenPair> {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  })

  // Verifica o hash mesmo se o usuário não existe para evitar timing attacks
  // (um atacante poderia medir o tempo de resposta para saber se o email existe)
  const dummyHash = "$2b$12$dummyhashtopreventtimingattacks.padding.here"
  const isValid = user
    ? await bcrypt.compare(input.password, user.passwordHash ?? dummyHash)
    : await bcrypt.compare(input.password, dummyHash) // sempre falha, mas toma o mesmo tempo

  if (!user || !isValid) {
    const error = new Error("Credenciais inválidas.") as any
    error.code = "INVALID_CREDENTIALS"
    error.statusCode = 401
    throw error
  }

  return issueTokens(user.id, user.email, user.name)
}

/**
 * Renova o par de tokens usando um refresh token.
 *
 * Implementa refresh token rotation com detecção de roubo:
 * 1. Verifica a assinatura JWT do refresh token
 * 2. Busca o registro no banco pelo jti
 * 3. Se o token já foi usado (usedAt != null) → detecta reuse → revoga TUDO
 * 4. Se válido → marca como usado → emite novo par → retorna
 */
export async function refreshTokens(refreshToken: string): Promise<TokenPair> {
  // Passo 1: verifica assinatura e expiração JWT
  let payload: { sub: string; jti: string }
  try {
    payload = verifyRefreshToken(refreshToken)
  } catch {
    const error = new Error("Refresh token inválido ou expirado.") as any
    error.code = "REFRESH_TOKEN_INVALID"
    error.statusCode = 401
    throw error
  }

  // Passo 2: busca no banco pelo jti (o ID do registro)
  const storedToken = await prisma.refreshToken.findUnique({
    where: { id: payload.jti },
    include: { user: { select: { id: true, email: true, name: true } } },
  })

  if (!storedToken || storedToken.revokedAt) {
    const error = new Error("Refresh token inválido.") as any
    error.code = "REFRESH_TOKEN_INVALID"
    error.statusCode = 401
    throw error
  }

  // Passo 3: detecta reuse — token já foi usado antes?
  if (storedToken.usedAt) {
    // Sinal de possível roubo de token: revoga TODOS os tokens do usuário
    await prisma.refreshToken.updateMany({
      where: { userId: storedToken.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    })

    storedToken.user
    const error = new Error("Token já utilizado. Faça login novamente.") as any
    error.code = "REFRESH_TOKEN_REUSED"
    error.statusCode = 401
    throw error
  }

  // Passo 4: marca o token atual como usado (rotação)
  await prisma.refreshToken.update({
    where: { id: payload.jti },
    data: { usedAt: new Date() },
  })

  // Emite novo par de tokens
  const { user } = storedToken
  return issueTokens(user.id, user.email, user.name)
}

/**
 * Revoga um refresh token (logout).
 * O access token continua válido até expirar (15min) — comportamento esperado.
 * O frontend deve descartar o access token localmente ao fazer logout.
 */
export async function revokeRefreshToken(refreshToken: string): Promise<void> {
  try {
    const payload = verifyRefreshToken(refreshToken)

    await prisma.refreshToken.update({
      where: { id: payload.jti },
      data: { revokedAt: new Date() },
    })
  } catch {
    // Se o token for inválido, não fazemos nada — logout silencioso
  }
}

/**
 * Cria ou vincula uma conta OAuth a um usuário.
 *
 * Lógica de upsert em três cenários:
 * 1. OAuthAccount já existe → retorna o usuário vinculado (login recorrente)
 * 2. Email já existe mas sem esta conta OAuth → vincula OAuth ao usuário existente
 * 3. Nenhum dos dois → cria novo usuário + OAuthAccount + seed de categorias
 */
export async function upsertOAuthUser(input: {
  provider: string
  providerAccountId: string
  email: string
  name: string
}): Promise<TokenPair> {
  const { provider, providerAccountId, email, name } = input

  // Cenário 1: OAuth Account já conhecida
  const existingOAuth = await prisma.oAuthAccount.findUnique({
    where: { provider_providerAccountId: { provider, providerAccountId } },
    include: { user: true },
  })

  if (existingOAuth) {
    return issueTokens(existingOAuth.user.id, existingOAuth.user.email, existingOAuth.user.name)
  }

  // Cenário 2: email já existe → vincula OAuth ao usuário existente
  const existingUser = await prisma.user.findUnique({ where: { email } })

  if (existingUser) {
    await prisma.oAuthAccount.create({
      data: { provider, providerAccountId, userId: existingUser.id },
    })
    return issueTokens(existingUser.id, existingUser.email, existingUser.name)
  }

  // Cenário 3: usuário novo via OAuth
  const userId = crypto.randomUUID()
  const seedOps = buildSeedOperations(prisma, userId)

  await prisma.$transaction([
    prisma.user.create({
      data: { id: userId, name, email }, // sem passwordHash — OAuth puro
    }),
    prisma.oAuthAccount.create({
      data: { provider, providerAccountId, userId },
    }),
    ...seedOps,
  ])

  return issueTokens(userId, email, name)
}
