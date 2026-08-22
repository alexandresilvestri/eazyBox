import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";

const ACCESS_KEY = "eazybox.accessToken";
const REFRESH_KEY = "eazybox.refreshToken";

const extra = Constants.expoConfig?.extra as { apiUrl?: string } | undefined;
export const API_URL = extra?.apiUrl ?? "http://localhost:3000";

export type Tokens = { accessToken: string; refreshToken: string };

export const saveTokens = async ({ accessToken, refreshToken }: Tokens) => {
  await SecureStore.setItemAsync(ACCESS_KEY, accessToken);
  await SecureStore.setItemAsync(REFRESH_KEY, refreshToken);
};

export const readAccessToken = () => SecureStore.getItemAsync(ACCESS_KEY);
export const readRefreshToken = () => SecureStore.getItemAsync(REFRESH_KEY);

export const clearTokens = async () => {
  await SecureStore.deleteItemAsync(ACCESS_KEY);
  await SecureStore.deleteItemAsync(REFRESH_KEY);
};

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const token = await readAccessToken();
  const res = await fetch(`${API_URL}/api${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-Client": "mobile",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });

  if (res.status === 204) {
    return undefined as T;
  }

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(
      (body as { error?: string } | null)?.error ?? "Erro inesperado",
    );
  }
  return body as T;
}
