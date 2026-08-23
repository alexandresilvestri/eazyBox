import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const ACCESS_KEY = "eazybox.accessToken";
const REFRESH_KEY = "eazybox.refreshToken";

const extra = Constants.expoConfig?.extra as { apiUrl?: string } | undefined;
export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? extra?.apiUrl ?? "http://localhost:3000";

export type Tokens = { accessToken: string; refreshToken: string };

const isWeb = Platform.OS === "web";

const writeToken = async (key: string, value: string) => {
  if (isWeb) {
    localStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
};

const readToken = async (key: string) =>
  isWeb ? localStorage.getItem(key) : SecureStore.getItemAsync(key);

const deleteToken = async (key: string) => {
  if (isWeb) {
    localStorage.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
};

export const saveTokens = async ({ accessToken, refreshToken }: Tokens) => {
  await writeToken(ACCESS_KEY, accessToken);
  await writeToken(REFRESH_KEY, refreshToken);
};

export const readAccessToken = () => readToken(ACCESS_KEY);
export const readRefreshToken = () => readToken(REFRESH_KEY);

export const clearTokens = async () => {
  await deleteToken(ACCESS_KEY);
  await deleteToken(REFRESH_KEY);
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
