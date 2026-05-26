import type { ApiErrorBody } from "./api-types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export const useMocks = process.env.NEXT_PUBLIC_USE_MOCKS !== "false";

export class ApiError extends Error {
  status: number;
  campos?: string[];
  desbloqueioEm?: string;

  constructor(status: number, body: ApiErrorBody) {
    super(body.error);
    this.name = "ApiError";
    this.status = status;
    this.campos = body.campos;
    this.desbloqueioEm = body.desbloqueio_em;
  }
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = typeof window !== "undefined" ? window.localStorage.getItem("safeaccess_token") : null;
  const headers = new Headers(init?.headers);

  if (!headers.has("Content-Type") && init?.body) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers,
    cache: "no-store"
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("Content-Type") ?? "";
  const body = contentType.includes("application/json") ? await response.json() : await response.text();

  if (!response.ok) {
    const errorBody = typeof body === "string" ? { error: body } : body;
    throw new ApiError(response.status, errorBody);
  }

  return body as T;
}
