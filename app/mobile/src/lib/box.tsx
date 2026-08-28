import { createContext, useContext, useMemo, type ReactNode } from "react";
import { historyStart } from "@eazybox/shared";
import type {
  Announcement,
  Checkin,
  WorkoutSessionWithStats,
} from "@eazybox/shared";

import { trainedDays } from "@/lib/sessions";
import { useApi } from "@/lib/use-api";

type BoxData = {
  sessions: WorkoutSessionWithStats[];
  checkins: Checkin[];
  announcements: Announcement[];
  trained: Set<string>;
  reload: () => Promise<void>;
};

const BoxContext = createContext<BoxData | null>(null);

const NO_SESSIONS: WorkoutSessionWithStats[] = [];
const NO_CHECKINS: Checkin[] = [];
const NO_ANNOUNCEMENTS: Announcement[] = [];

export function BoxProvider({ children }: { children: ReactNode }) {
  const from = useMemo(() => historyStart(), []);
  const sessions = useApi<WorkoutSessionWithStats[]>(
    `/workout-sessions?from=${from}`,
    NO_SESSIONS,
  );
  const checkins = useApi<Checkin[]>("/checkins", NO_CHECKINS);
  const announcements = useApi<Announcement[]>(
    "/announcements",
    NO_ANNOUNCEMENTS,
  );

  const value = useMemo<BoxData>(
    () => ({
      sessions: sessions.data,
      checkins: checkins.data,
      announcements: announcements.data,
      trained: trainedDays(checkins.data, sessions.data),
      reload: async () => {
        await Promise.all([
          sessions.reload(),
          checkins.reload(),
          announcements.reload(),
        ]);
      },
    }),
    [sessions, checkins, announcements],
  );

  return <BoxContext.Provider value={value}>{children}</BoxContext.Provider>;
}

export function useBox() {
  const context = useContext(BoxContext);
  if (!context) {
    throw new Error("useBox must be used inside BoxProvider");
  }
  return context;
}
