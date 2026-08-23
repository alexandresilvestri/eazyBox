import { useCallback, useEffect, useRef, useState } from 'react'
import { apiFetch } from '@/lib/api'

export function useApi<T>(path: string, initial: T) {
  const fallback = useRef(initial)
  const [data, setData] = useState<T>(initial)
  const [loading, setLoading] = useState(true)

  const reload = useCallback(
    () =>
      apiFetch<T>(path)
        .then(setData)
        .catch(() => setData(fallback.current))
        .finally(() => setLoading(false)),
    [path]
  )

  useEffect(() => {
    void reload()
  }, [reload])

  return { data, loading, reload }
}
