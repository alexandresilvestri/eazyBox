import { useCallback, useEffect, useRef, useState } from "react";

import { apiFetch } from "@/lib/api";

export function useApi<T>(path: string, initial: T) {
  const fallback = useRef(initial);
  const [data, setData] = useState<T>(initial);
  const [loadedPath, setLoadedPath] = useState<string | null>(null);

  const reload = useCallback(
    () =>
      apiFetch<T>(path)
        .then(setData)
        .catch(() => setData(fallback.current))
        .finally(() => setLoadedPath(path)),
    [path],
  );

  useEffect(() => {
    void reload();
  }, [reload]);

  return { data, loading: loadedPath !== path, reload };
}
