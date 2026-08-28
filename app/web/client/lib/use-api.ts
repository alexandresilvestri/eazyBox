import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { apiFetch } from '@/lib/api'

export function useApi<T>(path: string | null, initial: T) {
  const fallback = useRef(initial)
  const [data, setData] = useState<T>(initial)

  const reload = useCallback(() => {
    if (!path) return Promise.resolve()

    return apiFetch<T>(path)
      .then(setData)
      .catch(() => setData(fallback.current))
  }, [path])

  useEffect(() => {
    void reload()
  }, [reload])

  return useMemo(() => ({ data, reload }), [data, reload])
}
