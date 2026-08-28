import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import {
  addDays,
  checkinState,
  dayAndMonth,
  fullName,
  hourLabel,
  isFull,
  isoDate,
  longDate,
  parseWod,
  sessionsOn,
  weekDayOf,
} from '@eazybox/shared'
import type { WorkoutSessionWithStats } from '@eazybox/shared'
import { useBox } from '@/box-context'
import { Badge, type Tone } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BarChart } from '@/components/ui-x/BarChart'
import { HairlineRow, HairlineTable } from '@/components/ui-x/HairlineTable'
import { OccupancyBar } from '@/components/ui-x/OccupancyBar'
import { Page } from '@/components/ui-x/Page'
import { Panel } from '@/components/ui-x/Panel'
import { PickerDialog } from '@/components/ui-x/PickerDialog'
import { StatCard } from '@/components/ui-x/StatCard'
import { apiFetch } from '@/lib/api'
import {
  byTimeSlot,
  capacityOf,
  dayRange,
  occupancyRate,
  occupiedOf,
} from '@/lib/reports'

const CHART_DAYS = 7

const statusOf = (
  session: WorkoutSessionWithStats,
  now: Date
): { label: string; tone: Tone } => {
  if (isFull(session)) return { label: 'Lotada', tone: 'highlight' }
  if (checkinState(session, now) === 'closed') {
    return { label: 'Encerrada', tone: 'plain' }
  }
  return { label: 'Aberta', tone: 'plain' }
}

export default function Dashboard() {
  const { sessions, schedule, workouts, users, reload } = useBox()
  const [publishing, setPublishing] = useState(false)

  const now = useMemo(() => new Date(), [])
  const today = isoDate(now)
  const tomorrowDate = addDays(now, 1)
  const tomorrow = isoDate(tomorrowDate)

  const todays = sessionsOn(sessions, today)
  const tomorrows = sessionsOn(sessions, tomorrow)
  const chartWindow = useMemo(
    () => dayRange(addDays(now, -(CHART_DAYS - 1)), CHART_DAYS),
    [now]
  )
  const slotBars = useMemo(
    () => byTimeSlot(sessions, chartWindow),
    [sessions, chartWindow]
  )

  const activeMembers = users.filter((user) => user.isActive)
  const fullSessions = todays.filter(isFull)
  const dayWorkout = workouts.find(
    (workout) => workout.id === todays[0]?.workoutId
  )

  async function publishTomorrow(workoutId: string) {
    const weekDay = weekDayOf(tomorrowDate)
    await Promise.all(
      schedule
        .filter((slot) => slot.weekDay === weekDay)
        .map((slot) =>
          apiFetch('/workout-sessions', {
            method: 'POST',
            body: JSON.stringify({
              workoutScheduleId: slot.id,
              workoutId,
              sessionDate: tomorrow,
            }),
          }).catch(() => undefined)
        )
    )
    await reload.sessions()
  }

  return (
    <Page
      eyebrow={longDate(now)}
      title="Hoje na box"
      actions={
        <Button onClick={() => setPublishing(true)}>
          Publicar WOD de amanhã
        </Button>
      }
    >
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="Check-ins hoje"
          value={occupiedOf(todays)}
          detail={`de ${capacityOf(todays)} vagas do dia`}
          big
        />
        <StatCard
          label="Ocupação média"
          value={`${Math.round(occupancyRate(todays) * 100)}%`}
          detail={`${todays.length} aulas hoje`}
        />
        <StatCard
          label="Alunos ativos"
          value={activeMembers.length}
          detail={`${users.length - activeMembers.length} inativos · ${users.length} cadastrados`}
        />
        <StatCard
          label="Aulas lotadas"
          value={fullSessions.length}
          detail={
            fullSessions.length > 0
              ? `${fullSessions.map((item) => hourLabel(item.time)).join(', ')} · fila de espera off`
              : 'nenhuma aula lotada'
          }
          highlight={fullSessions.length > 0}
        />
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-[1.6fr_1fr] gap-4">
        <div className="flex min-h-0 flex-col gap-3.5">
          <div className="flex items-center justify-between">
            <span className="section-label">
              Aulas de hoje
              {dayWorkout ? ` · ${parseWod(dayWorkout.wod).name}` : ''}
            </span>
            <Link to="/aulas" className="text-sm text-ink-3 hover:text-ink-1">
              Ver todas →
            </Link>
          </div>
          <HairlineTable
            columns="80px 1fr 130px 90px 100px"
            head={['Hora', 'Coach', 'Ocupação', 'Vagas', 'Status']}
            className="min-h-0 flex-1"
          >
            {todays.map((session) => {
              const status = statusOf(session, now)
              return (
                <HairlineRow key={session.id}>
                  <span className="font-bold">{hourLabel(session.time)}</span>
                  <span>
                    {session.coach
                      ? fullName(
                          session.coach.firstName,
                          session.coach.lastName
                        )
                      : '—'}
                  </span>
                  <OccupancyBar
                    value={session.occupied}
                    total={session.capacity}
                    withLabel
                  />
                  <span className="text-base text-ink-2">
                    {session.occupied}/{session.capacity}
                  </span>
                  <Badge tone={status.tone}>{status.label}</Badge>
                </HairlineRow>
              )
            })}
          </HairlineTable>
        </div>

        <div className="flex min-h-0 flex-col gap-4">
          <Panel className="min-h-0 flex-1 gap-3.5">
            <span className="section-label">
              Check-ins por horário · {CHART_DAYS} dias
            </span>
            <BarChart bars={slotBars} />
          </Panel>

          <Panel className="gap-3">
            <span className="section-label">Precisa de você</span>
            <div className="flex flex-col">
              {tomorrows.length === 0 ? (
                <button
                  type="button"
                  onClick={() => setPublishing(true)}
                  className="flex items-center justify-between gap-3 border-t border-hairline py-2.5 text-md"
                >
                  <span>WOD de amanhã sem publicação</span>
                  <span className="text-sm text-ink-3">Resolver</span>
                </button>
              ) : null}
              {fullSessions.map((session) => (
                <Link
                  key={session.id}
                  to="/aulas"
                  className="flex items-center justify-between gap-3 border-t border-hairline py-2.5 text-md"
                >
                  <span>Aula das {hourLabel(session.time)} lotada</span>
                  <span className="text-sm text-ink-3">Ampliar vagas</span>
                </Link>
              ))}
              {users.length - activeMembers.length > 0 ? (
                <Link
                  to="/clientes"
                  className="flex items-center justify-between gap-3 border-t border-hairline py-2.5 text-md"
                >
                  <span>
                    {users.length - activeMembers.length} alunos inativos
                  </span>
                  <span className="text-sm text-ink-3">Ver</span>
                </Link>
              ) : null}
            </div>
          </Panel>
        </div>
      </div>

      <PickerDialog
        open={publishing}
        title={`Publicar aulas de ${dayAndMonth(tomorrowDate)}`}
        description="Cria as aulas de amanhã a partir da grade de horários, com o WOD escolhido."
        placeholder="Escolha o WOD"
        options={workouts.map((workout) => ({
          value: workout.id,
          label: parseWod(workout.wod).name,
        }))}
        confirmLabel="Publicar"
        onOpenChange={setPublishing}
        onConfirm={publishTomorrow}
      />
    </Page>
  )
}
