import type { Checkin } from "./types";

export const isActive = (checkin: Checkin) => !checkin.undone;

export const countBySession = (checkins: Checkin[]) => {
  const counts = new Map<string, number>();
  for (const checkin of checkins.filter(isActive)) {
    counts.set(
      checkin.workoutSessionId,
      (counts.get(checkin.workoutSessionId) ?? 0) + 1,
    );
  }
  return counts;
};

export const activeCheckin = (checkins: Checkin[], workoutSessionId: string) =>
  checkins.find(
    (checkin) =>
      checkin.workoutSessionId === workoutSessionId && isActive(checkin),
  );
