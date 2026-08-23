export type ApiError = { error: string; issues?: unknown[] }

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const res = await fetch(`/api${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init.headers },
  })

  if (res.status === 204) {
    return undefined as T
  }

  const body = await res.json().catch(() => null)
  if (!res.ok) {
    throw new Error((body as ApiError | null)?.error ?? 'Erro inesperado')
  }
  return body as T
}
