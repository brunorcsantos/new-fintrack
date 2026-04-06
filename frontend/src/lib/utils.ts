import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * src/lib/utils.ts
 *
 * Utilitários centralizados — formatação, conversão e classes CSS.
 */

// ─── CSS classes ──────────────────────────────────────────────────────────────

/** Combina classes Tailwind sem conflitos (usado por todos os componentes ui/) */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ─── Valores monetários ───────────────────────────────────────────────────────

/**
 * Converte Decimal do Prisma (string) → number.
 * Necessário porque o Prisma serializa Decimal como string para preservar precisão.
 */
export function toNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined) return 0
  return parseFloat(String(value))
}

/** Formata como BRL: formatCurrency(1500) → "R$ 1.500,00" */
export function formatCurrency(value: string | number | null | undefined): string {
  const num = toNumber(value)
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(num)
}

/** Formato compacto para gráficos: 1500 → "R$ 1,5K" */
export function formatCompact(value: string | number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(toNumber(value))
}

// ─── Datas ────────────────────────────────────────────────────────────────────

/**
 * Converte Date local → string ISO com hora 12:00 UTC.
 * Evita problemas de fuso horário ao persistir datas no backend.
 */
export function toApiDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}T12:00:00.000Z`
}

/** Formata string ISO para exibição em pt-BR */
export function formatDate(
  isoString: string,
  style: "numeric" | "short" | "long" = "numeric"
): string {
  const date = new Date(isoString)
  if (style === "numeric") return new Intl.DateTimeFormat("pt-BR").format(date)
  if (style === "short") {
    return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" })
      .format(date)
      .replace(".", "")
  }
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" }).format(date)
}

export function formatShortDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(d)
}

/** Retorna mês atual no formato "YYYY-MM" */
export function currentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
}

/** Formata "YYYY-MM" para exibição: "Março 2026" ou "mar/26" */
export function formatMonth(yyyyMM: string, style: "long" | "short" = "long"): string {
  const [year, month] = yyyyMM.split("-")
  const date = new Date(Number(year), Number(month) - 1, 1)
  if (style === "short") {
    return new Intl.DateTimeFormat("pt-BR", { month: "short", year: "2-digit" })
      .format(date)
      .replace(". de ", "/")
      .replace(".", "")
  }
  return new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(date)
}

/** Navega N meses a partir de "YYYY-MM" */
export function addMonths(yyyyMM: string, delta: number): string {
  const [year, month] = yyyyMM.split("-").map(Number)
  const date = new Date(year, month - 1 + delta, 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
}

// ─── Idempotência ─────────────────────────────────────────────────────────────

/** Gera chave UUID v4 para idempotência. Gere ao iniciar o formulário, não ao submeter. */
export function generateIdempotencyKey(): string {
  return crypto.randomUUID()
}

// ─── Miscelânea ───────────────────────────────────────────────────────────────

/** Retorna iniciais do nome para avatares: "João Silva" → "JS" */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/** Adiciona opacidade hex: hexWithOpacity("#5A8FE8", 0.2) → "#5A8FE833" */
export function hexWithOpacity(hex: string, opacity: number): string {
  const alpha = Math.round(opacity * 255).toString(16).padStart(2, "0")
  return `${hex}${alpha}`
}
