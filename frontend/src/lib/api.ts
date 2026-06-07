/**
 * src/lib/api.ts
 *
 * HTTP client tipado com renovação automática de access token.
 *
 * Conceitos implementados:
 *
 * 1. SINGLETON: uma instância de ApiClient para toda a aplicação.
 *    Tokens são armazenados em propriedades privadas da instância.
 *
 * 2. AUTO-REFRESH: quando uma request retorna 401, o cliente
 *    automaticamente tenta renovar o access token usando o refresh token,
 *    e depois repete a request original — transparente para quem chamou.
 *
 * 3. REFRESH PROMISE SINGLETON: se múltiplas requests falharem com 401
 *    ao mesmo tempo (ex: dashboard carrega 3 endpoints em paralelo),
 *    apenas UM refresh é feito — as demais aguardam a mesma Promise.
 *    Sem isso, teríamos 3 refreshes simultâneos, o que causaria
 *    invalidação de tokens por rotação.
 *
 * 4. FINALLY OBRIGATÓRIO: o refreshPromise é sempre limpo no finally,
 *    mesmo que o refresh falhe. Sem isso, uma falha de rede deixaria
 *    o cliente travado (todas as requests ficariam aguardando uma
 *    Promise que nunca resolve).
 */

import type { TokenPair, ApiError } from "@/types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3333";

// Chave usada para persistir tokens no localStorage
const STORAGE_KEY = "fintrack_tokens";

class ApiClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  // Promise compartilhada entre todas as requests que aguardam o refresh
  private refreshPromise: Promise<void> | null = null;

  constructor() {
    // Restaura tokens do localStorage ao inicializar
    // (persiste o login entre reloads de página)
    this.loadTokensFromStorage();
  }

  // ─── Gerenciamento de tokens ───────────────────────────────────────────────

  setTokens(tokens: TokenPair): void {
    this.accessToken = tokens.accessToken;
    this.refreshToken = tokens.refreshToken;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
  }

  clearTokens(): void {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem(STORAGE_KEY);
  }

  isAuthenticated(): boolean {
    return this.accessToken !== null;
  }

  private loadTokensFromStorage(): void {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    try {
      const tokens = JSON.parse(stored) as TokenPair;
      this.accessToken = tokens.accessToken;
      this.refreshToken = tokens.refreshToken;
    } catch {
      // JSON inválido no storage — limpa e ignora
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  // ─── Request base ──────────────────────────────────────────────────────────

  /**
   * Faz uma request HTTP com o access token atual.
   * Em caso de 401, tenta renovar o token e repete.
   * Em caso de falha no refresh, limpa os tokens (logout automático).
   */
  private async request<T>(
    path: string,
    options: RequestInit = {},
  ): Promise<T> {
    const response = await this.doRequest(path, options);

    // Sucesso: retorna o corpo parseado
    if (response.ok) {
      // 204 No Content não tem corpo
      if (response.status === 204) return undefined as T;
      return response.json() as Promise<T>;
    }

    // 401 em /auth/refresh significa que o refresh token também expirou
    // Não tenta renovar novamente — evita loop infinito
    if (response.status === 401 && !path.includes("/auth/refresh")) {
      // Garante que apenas um refresh acontece por vez
      if (!this.refreshPromise) {
        this.refreshPromise = this.tryRefresh();
      }

      try {
        await this.refreshPromise;
        // Refresh bem-sucedido: repete a request original com o novo token
        const retryResponse = await this.doRequest(path, options);
        if (retryResponse.ok) {
          if (retryResponse.status === 204) return undefined as T;
          return retryResponse.json() as Promise<T>;
        }
        // Segunda tentativa também falhou
        const error = (await retryResponse.json()) as ApiError;
        throw error;
      } catch {
        // Refresh falhou: faz logout automático
        this.clearTokens();
        // Dispara evento para o AuthContext reagir e redirecionar para /login
        window.dispatchEvent(new CustomEvent("fintrack:logout"));
        throw {
          error: "SESSION_EXPIRED",
          message: "Sessão expirada. Faça login novamente.",
          statusCode: 401,
        };
      } finally {
        // CRÍTICO: sempre limpa a promise, mesmo em caso de erro
        // Sem isso, uma falha de rede deixa o cliente em estado zumbi
        this.refreshPromise = null;
      }
    }

    // Outros erros HTTP: parseia e lança
    const error = (await response.json()) as ApiError;
    throw error;
  }

  /**
   * Executa a chamada fetch com os headers corretos.
   * Separado do método request() para permitir o retry após refresh.
   */
  private async doRequest(
    path: string,
    options: RequestInit,
  ): Promise<Response> {
    const headers: Record<string, string> = {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers as Record<string, string>),
    };

    if (this.accessToken) {
      headers["Authorization"] = `Bearer ${this.accessToken}`;
    }
    console.log("doRequest:", options.method, `${API_URL}${path}`, headers);
    return fetch(`${API_URL}${path}`, { ...options, headers });
  }

  /**
   * Tenta renovar o access token usando o refresh token armazenado.
   * Atualiza os tokens em caso de sucesso.
   * Lança erro em caso de falha (refresh token expirado ou revogado).
   */
  private async tryRefresh(): Promise<void> {
    if (!this.refreshToken) {
      throw new Error("Sem refresh token disponível.");
    }

    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: this.refreshToken }),
    });

    if (!response.ok) {
      throw new Error("Refresh token inválido.");
    }

    const tokens = (await response.json()) as TokenPair;
    this.setTokens(tokens);
  }

  // ─── Métodos HTTP públicos ─────────────────────────────────────────────────

  get<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: "GET" });
  }

  post<T>(
    path: string,
    body?: unknown,
    headers?: Record<string, string>,
  ): Promise<T> {
    return this.request<T>(path, {
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
      headers,
    });
  }

  put<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, {
      method: "PUT",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  delete<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: "DELETE" });
  }

  // ─── Endpoints de Auth ─────────────────────────────────────────────────────

  async login(email: string, password: string): Promise<void> {
    const tokens = await this.post<TokenPair>("/auth/login", {
      email,
      password,
    });
    this.setTokens(tokens);
  }

  async register(name: string, email: string, password: string): Promise<void> {
    const tokens = await this.post<TokenPair>("/auth/register", {
      name,
      email,
      password,
    });
    this.setTokens(tokens);
  }

  async logout(): Promise<void> {
    if (this.refreshToken) {
      // Tenta revogar o token no servidor (ignora falhas — logout local sempre acontece)
      await this.post("/auth/logout", {
        refreshToken: this.refreshToken,
      }).catch(() => {});
    }
    this.clearTokens();
  }

  // OAuth: apenas redireciona para o backend iniciar o fluxo
  loginWithGoogle(): void {
    window.location.href = `${API_URL}/auth/google`;
  }

  loginWithGitHub(): void {
    window.location.href = `${API_URL}/auth/github`;
  }
}

// Singleton exportado — use este em toda a aplicação
export const api = new ApiClient();
