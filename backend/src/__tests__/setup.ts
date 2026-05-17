/**
 * src/__tests__/setup.ts
 *
 * Setup global dos testes. Carrega variáveis de ambiente de teste
 * ANTES de qualquer import que dependa de process.env.
 */

// Define variáveis de teste antes de qualquer import
process.env.DATABASE_URL = process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/fintrack_test"
process.env.JWT_SECRET = "test-jwt-secret-minimum-32-characters-long!!"
process.env.JWT_REFRESH_SECRET = "test-refresh-secret-minimum-32-characters!!"
process.env.NODE_ENV = "test"
process.env.PORT = "3334"
process.env.FRONTEND_URL = "http://localhost:5173"
