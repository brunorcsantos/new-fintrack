/**
 * src/types/index.ts
 *
 * Tipos globais compartilhados por toda a aplicação.
 * Espelham os modelos do backend — mantidos em sincronia manualmente
 * até a geração automática via openapi-typescript (Fase 4).
 */

// ─── Auth ─────────────────────────────────────────────────────────────────────

export type TokenPair = {
  accessToken: string
  refreshToken: string
}

export type AuthUser = {
  id: string
  email: string
  name: string
  createdAt: string
  hasPassword: boolean
  providers: string[] // ["google", "github"]
}

// ─── Categoria ────────────────────────────────────────────────────────────────

export type Subcategory = {
  id: string
  name: string
  icon: string
  categoryId: string
}

export type Category = {
  id: string
  name: string
  icon: string
  color: string
  userId: string
  subcategories: Subcategory[]
}

// ─── Transação ────────────────────────────────────────────────────────────────

export type TxType = "income" | "expense"
export type TxTypeFilter = TxType | "all"

export type Transaction = {
  id: string
  description: string
  amount: string     // string porque vem como Decimal do Prisma
  type: TxType
  date: string       // ISO 8601
  notes: string | null
  userId: string
  categoryId: string
  subcategoryId: string | null
  category: Pick<Category, "id" | "name" | "icon" | "color">
  subcategory: Pick<Subcategory, "id" | "name" | "icon"> | null
}


export type TransactionSummary = {
  totalIncome: string
  totalExpense: string
  balance: string
  byCategory: Array<{
    categoryId: string
    categoryName: string
    categoryColor: string
    categoryIcon: string
    total: string
    totalExpense: string
    percentage: number
  }>
}



// ─── Orçamento ────────────────────────────────────────────────────────────────

export type Budget = {
  id: string
  amount: string
  month: string // "YYYY-MM"
  userId: string
  categoryId: string | null
  subcategoryId: string | null
  category: Pick<Category, "id" | "name" | "icon" | "color"> | null
  subcategory: Pick<Subcategory, "id" | "name" | "icon"> | null
}

// ─── Cartão de Crédito ────────────────────────────────────────────────────────

export type CreditCard = {
  id: string
  name: string
  icon: string
  color: string
  closingDay: number
  dueDay: number
  limit: string | null
  active: boolean
  notifyDaysBefore: number
  userId: string
}

export type CreditCardInvoice = {
  id: string
  cardId: string
  month: string
  dueDate: string
  totalAmount: string
  paid: boolean
  paidAt: string | null
}

// ─── Notificação ──────────────────────────────────────────────────────────────

export type NotificationType =
  | "invoice_due"
  | "budget_alert"
  | "recurring_pending"
  | "promotion"
  | "custom"

export type Notification = {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  data: Record<string, unknown> | null
  scheduledAt: string | null
  createdAt: string
}

// ─── Paginação ────────────────────────────────────────────────────────────────

export type PaginatedResponse<T> = {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// ─── Erro da API ──────────────────────────────────────────────────────────────

export type ApiError = {
  error: string        // código semântico: "INVALID_CREDENTIALS"
  message: string      // mensagem legível: "Credenciais inválidas."
  statusCode: number
  fields?: Record<string, string[]>  // erros de validação por campo
}
