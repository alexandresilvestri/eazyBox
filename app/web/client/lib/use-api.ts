import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { apiFetch } from '@/lib/api'

export function useApi<T>(path: string | null, initial: T) {
  const fallback = useRef(initial)
  const [data, setData] = useState<T>(initial)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(path !== null)

  const reload = useCallback(() => {
    if (!path) return Promise.resolve()

    return apiFetch<T>(path)
      .then((next) => {
        setData(next)
        setError(null)
      })
      .catch((err: unknown) => {
        setData(fallback.current)
        setError(err instanceof Error ? err.message : 'Erro inesperado')
      })
      .finally(() => setLoading(false))
  }, [path])

  useEffect(() => {
    void reload()
  }, [reload])

  return useMemo(
    () => ({ data, error, loading, reload }),
    [data, error, loading, reload]
  )
}
