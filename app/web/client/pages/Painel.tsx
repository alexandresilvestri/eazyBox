import { useMemo } from 'react'
import { useNavigate } from 'react-router'
import type {
  Checkin,
  WeekDay,
  WorkoutSchedule,
  WorkoutSession,
} from '@eazybox/shared'
import {
  countBySession,
  isoDate,
  startOfWeek,
  weekDates,
} from '@eazybox/shared'
import { Band, StatCell } from '@/components/ui-x/Band'
import { WeekGrid, type WeekGridCell } from '@/components/ui-x/WeekGrid'
import { useApi } from '@/lib/use-api'

export function Painel() {
  const navigate = useNavigate()
  const monday = useMemo(() => startOfWeek(new Date()), [])
  const dates = useMemo(() => weekDates(monday), [monday])

  const { data: schedule } = useApi<WorkoutSchedule[]>('/workout-schedule', [])
  const { data: sessions } = useApi<WorkoutSession[]>(
    `/workout-sessions?from=${isoDate(monday)}`,
    []
  )
  const { data: checkins } = useApi<Checkin[]>('/checkins', [])

  const weekIsoDates = useMemo(() => dates.map(isoDate), [dates])

  const weekSessions = useMemo(
    () =>
      sessions.filter((session) =>
        weekIsoDates.includes(session.sessionDate.slice(0, 10))
      ),
    [sessions, weekIsoDates]
  )

  const counts = useMemo(() => countBySession(checkins), [checkins])

  const times = useMemo(
    () => [...new Set(schedule.map((slot) => slot.time))].sort(),
    [schedule]
  )

  const sessionBySlot = useMemo(
    () =>
      new Map(
        weekSessions.map((session) => [
          `${session.weekDay}|${session.time}`,
          session,
        ])
      ),
    [weekSessions]
  )

  const cellFor = (weekDay: WeekDay, time: string): WeekGridCell => {
    const session = sessionBySlot.get(`${weekDay}|${time}`)
    if (!session) return null
    return { sessionId: session.id, count: counts.get(session.id) ?? 0 }
  }

  const weekCheckins = weekSessions.reduce(
    (total, session) => total + (counts.get(session.id) ?? 0),
    0
  )

  return (
    <Band
      title="Semana"
      subtitle="Ocupação de cada sessão da semana corrente. Cada marca é um check-in confirmado."
    >
      <div className="flex flex-col gap-7">
        <div className="flex flex-wrap gap-10">
          <StatCell label="Sessões" value={weekSessions.length} />
          <StatCell label="Check-ins" value={weekCheckins} />
          <StatCell label="Horários na grade" value={times.length} />
        </div>

        <WeekGrid
          times={times}
          dates={dates}
          cellFor={cellFor}
          onSelect={(sessionId) =>
            void navigate(`/sessoes?sessao=${sessionId}`)
          }
        />
      </div>
    </Band>
  )
}
