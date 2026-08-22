export type WeekDay =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

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
  createdAt: string;
  updatedAt: string;
};

export type Checkin = {
  id: string;
  userId: string;
  workoutSessionId: string;
  undone: boolean;
  createdAt: string;
};
