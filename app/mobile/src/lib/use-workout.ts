import type { Workout } from "@eazybox/shared";

import { useApi } from "@/lib/use-api";

export const useWorkout = (id?: string) =>
  useApi<Workout | null>(id ? `/workouts/${id}` : null, null).data;
