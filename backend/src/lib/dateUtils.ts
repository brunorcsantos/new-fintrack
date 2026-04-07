/**
 * src/lib/dateUtils.ts
 *
 * Utilitários de data para o backend.
 *
 * POR QUE ESTE ARQUIVO EXISTE?
 * O plano documenta explicitamente o risco de bugs de fuso horário:
 *   "Transação criada às 23h em Brasília (UTC-3) é 02h UTC do dia
 *    seguinte — aparece no mês errado no dashboard."
 *
 * Este utilitário centraliza operações com datas para que erros
 * de fuso não se espalhem pelo código. Toda manipulação de Date
 * deve passar por aqui ou usar os índices do Prisma diretamente.
 *
 * NOTA: O frontend usa `toApiDate()` em src/lib/utils.ts que converte
 * datas locais para ISO com T12:00:00Z, garantindo que a data caia
 * no dia correto independentemente do fuso do usuário.
 */

/**
 * Retorna o mês atual no formato "YYYY-MM".
 * Usa UTC para consistência com o banco.
 *
 * Exemplo: se for 2026-04-06, retorna "2026-04"
 */
export function currentMonth(): string {
  const now = new Date()
  const year = now.getUTCFullYear()
  const month = String(now.getUTCMonth() + 1).padStart(2, "0")
  return `${year}-${month}`
}

/**
 * Converte "YYYY-MM" para o range de DateTime do mês.
 * Útil para filtros de transações.
 *
 * "2026-03" → { gte: 2026-03-01T00:00:00Z, lt: 2026-04-01T00:00:00Z }
 */
export function monthToDateRange(yyyyMM: string): { gte: Date; lt: Date } {
  const [year, month] = yyyyMM.split("-").map(Number)
  return {
    gte: new Date(Date.UTC(year, month - 1, 1)),
    lt: new Date(Date.UTC(year, month, 1)),
  }
}
