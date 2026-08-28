import type { SessionAttendee } from "@eazybox/shared";

import { useApi } from "@/lib/use-api";

const NO_ATTENDEES: SessionAttendee[] = [];

export function useAttendees(sessionId?: string) {
  const { data, reload } = useApi<SessionAttendee[]>(
    sessionId ? `/workout-sessions/${sessionId}/attendees` : null,
    NO_ATTENDEES,
  );

  return { attendees: data, reload };
}
