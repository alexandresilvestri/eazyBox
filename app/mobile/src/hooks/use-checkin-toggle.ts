import {
  activeCheckin,
  type Checkin,
  type WorkoutSession,
} from "@eazybox/shared";
import { useCallback, useState } from "react";

import { apiFetch } from "@/lib/api";

export function useCheckinToggle(
  session: WorkoutSession | undefined,
  checkins: Checkin[],
  reload: () => Promise<unknown>,
) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const mine = session && activeCheckin(checkins, session.id);

  const toggle = useCallback(async () => {
    if (!session) return;
    setError(null);
    setPending(true);
    try {
      if (mine) {
        await apiFetch(`/checkins/${mine.id}/undo`, { method: "PATCH" });
      } else {
        await apiFetch("/checkins", {
          method: "POST",
          body: JSON.stringify({ workoutSessionId: session.id }),
        });
      }
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setPending(false);
    }
  }, [mine, reload, session]);

  return { mine, pending, error, toggle };
}
