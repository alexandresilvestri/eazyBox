export const WEEK_DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

export type WeekDay = (typeof WEEK_DAYS)[number];

export type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  isAdmin: boolean;
  isCoach: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Workout = {
  id: string;
  warmUp: string | null;
  skill: string | null;
  wod: string;
  createdAt: string;
  updatedAt: string;
};

export type WorkoutSchedule = {
  id: string;
  weekDay: WeekDay;
  time: string;
  capacity: number;
  coachId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type WorkoutSession = {
  id: string;
  workoutScheduleId: string;
  workoutId: string;
  weekDay: WeekDay;
  time: string;
  sessionDate: string;
  capacity: number;
  coachId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SessionCoach = {
  id: string;
  firstName: string;
  lastName: string;
};

export type WorkoutSessionWithStats = WorkoutSession & {
  occupied: number;
  coach: SessionCoach | null;
};

export type SessionAttendee = {
  userId: string;
  firstName: string;
  lastName: string;
  isCoach: boolean;
  checkedInAt: string;
};

export type Checkin = {
  id: string;
  userId: string;
  workoutSessionId: string;
  undone: boolean;
  createdAt: string;
};

export type Announcement = {
  id: string;
  body: string;
  authorId: string | null;
  createdAt: string;
  updatedAt: string;
};
