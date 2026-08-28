import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { historyStart } from '@eazybox/shared'
import type {
  Checkin,
  User,
  Workout,
  WorkoutSchedule,
  WorkoutSessionWithStats,
} from '@eazybox/shared'
import { useApi } from '@/lib/use-api'

type Reload = () => Promise<unknown>

type BoxData = {
  sessions: WorkoutSessionWithStats[]
  schedule: WorkoutSchedule[]
  workouts: Workout[]
  checkins: Checkin[]
  users: User[]
  loading: boolean
  error: string | null
  reload: {
    all: Reload
    sessions: Reload
    schedule: Reload
    workouts: Reload
    checkins: Reload
    users: Reload
  }
}

const BoxContext = createContext<BoxData | null>(null)

const NO_SESSIONS: WorkoutSessionWithStats[] = []
const NO_SCHEDULE: WorkoutSchedule[] = []
const NO_WORKOUTS: Workout[] = []
const NO_CHECKINS: Checkin[] = []
const NO_USERS: User[] = []

export function BoxProvider({ children }: { children: ReactNode }) {
  const from = useMemo(() => historyStart(), [])
  const sessions = useApi<WorkoutSessionWithStats[]>(
    `/workout-sessions?from=${from}`,
    NO_SESSIONS
  )
  const schedule = useApi<WorkoutSchedule[]>('/workout-schedule', NO_SCHEDULE)
  const workouts = useApi<Workout[]>('/workouts', NO_WORKOUTS)
  const checkins = useApi<Checkin[]>('/checkins', NO_CHECKINS)
  const users = useApi<User[]>('/users', NO_USERS)

  const value = useMemo<BoxData>(
    () => ({
      sessions: sessions.data,
      schedule: schedule.data,
      workouts: workouts.data,
      checkins: checkins.data,
      users: users.data,
      loading: [sessions, schedule, workouts, checkins, users].some(
        (resource) => resource.loading
      ),
      error:
        [sessions, schedule, workouts, checkins, users].find(
          (resource) => resource.error
        )?.error ?? null,
      reload: {
        all: () =>
          Promise.all([
            sessions.reload(),
            schedule.reload(),
            workouts.reload(),
            checkins.reload(),
            users.reload(),
          ]),
        sessions: sessions.reload,
        schedule: schedule.reload,
        workouts: workouts.reload,
        checkins: checkins.reload,
        users: users.reload,
      },
    }),
    [sessions, schedule, workouts, checkins, users]
  )

  return <BoxContext.Provider value={value}>{children}</BoxContext.Provider>
}

export function useBox() {
  const context = useContext(BoxContext)
  if (!context) {
    throw new Error('useBox must be used inside BoxProvider')
  }
  return context
}
