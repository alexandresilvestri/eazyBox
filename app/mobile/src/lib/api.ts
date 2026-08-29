import { deleteItem, readItem, writeItem } from "@/lib/storage";

const ACCESS_KEY = "eazybox.accessToken";
const REFRESH_KEY = "eazybox.refreshToken";
export const LOGIN_PATH = "/mobile/auth/login";
const REFRESH_PATH = "/mobile/auth/refresh";

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

export type Tokens = { accessToken: string; refreshToken: string };

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const saveTokens = async ({ accessToken, refreshToken }: Tokens) => {
  await writeItem(ACCESS_KEY, accessToken);
  await writeItem(REFRESH_KEY, refreshToken);
};

export const readAccessToken = () => readItem(ACCESS_KEY);
export const readRefreshToken = () => readItem(REFRESH_KEY);

export const clearTokens = async () => {
  await deleteItem(ACCESS_KEY);
  await deleteItem(REFRESH_KEY);
};

const requestRefresh = async () => {
  const refreshToken = await readRefreshToken();
  if (!refreshToken) return false;

  const res = await fetch(`${API_URL}/api${REFRESH_PATH}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    await clearTokens();
    return false;
  }

  await saveTokens((await res.json()) as Tokens);
  return true;
};

let refreshing: Promise<boolean> | null = null;

const refreshTokens = () => {
  refreshing ??= requestRefresh().finally(() => {
    refreshing = null;
  });
  return refreshing;
};

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const send = async () => {
    const token = await readAccessToken();
    return fetch(`${API_URL}/api${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init.headers,
      },
    });
  };

  let res = await send();
  if (res.status === 401 && path !== LOGIN_PATH && (await refreshTokens())) {
    res = await send();
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(
      (body as { error?: string } | null)?.error ?? "Erro inesperado",
      res.status,
    );
  }
  return body as T;
}
