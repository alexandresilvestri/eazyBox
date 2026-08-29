import type {
  Checkin,
  User,
  WorkoutSchedule,
  WorkoutSessionWithStats,
} from '@eazybox/shared'

let sequence = 0

export const aSession = (
  overrides: Partial<WorkoutSessionWithStats> = {}
): WorkoutSessionWithStats => ({
  id: `session-${++sequence}`,
  workoutScheduleId: 'slot-1',
  workoutId: 'workout-1',
  weekDay: 'monday',
  time: '06:00:00',
  sessionDate: '2026-08-24',
  capacity: 20,
  coachId: null,
  createdAt: '2026-08-01T00:00:00.000Z',
  updatedAt: '2026-08-01T00:00:00.000Z',
  occupied: 0,
  coach: null,
  ...overrides,
})

export const aCheckin = (overrides: Partial<Checkin> = {}): Checkin => ({
  id: `checkin-${++sequence}`,
  userId: 'user-1',
  workoutSessionId: 'session-1',
  undone: false,
  createdAt: '2026-08-24T05:00:00.000Z',
  ...overrides,
})

export const aUser = (overrides: Partial<User> = {}): User => ({
  id: `user-${++sequence}`,
  email: `user${sequence}@test.com`,
  firstName: 'Test',
  lastName: 'User',
  isActive: true,
  isAdmin: false,
  isCoach: false,
  createdAt: '2026-08-01T00:00:00.000Z',
  updatedAt: '2026-08-01T00:00:00.000Z',
  ...overrides,
})

export const aSlot = (
  overrides: Partial<WorkoutSchedule> = {}
): WorkoutSchedule => ({
  id: `slot-${++sequence}`,
  weekDay: 'monday',
  time: '06:00:00',
  capacity: 20,
  coachId: null,
  createdAt: '2026-08-01T00:00:00.000Z',
  updatedAt: '2026-08-01T00:00:00.000Z',
  ...overrides,
})
