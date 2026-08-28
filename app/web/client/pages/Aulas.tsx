import { useMemo, useState } from 'react'
import {
  addDays,
  checkinState,
  clockLabel,
  dayAndMonth,
  dayDate,
  fullName,
  hourLabel,
  initials,
  isFull,
  isoDate,
  opensAt,
  parseWod,
  sessionsOn,
  WEEK_DAY_LABEL,
  weekDayOf,
} from '@eazybox/shared'
import type { SessionAttendee, User } from '@eazybox/shared'
import { useBox } from '@/box-context'
import { Button } from '@/components/ui/button'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
} from '@/components/ui/icons'
import { IconButton } from '@/components/ui/icon-button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Avatar } from '@/components/ui-x/Avatar'
import { HairlineRow, HairlineTable } from '@/components/ui-x/HairlineTable'
import { Page } from '@/components/ui-x/Page'
import { Panel } from '@/components/ui-x/Panel'
import { PickerDialog } from '@/components/ui-x/PickerDialog'
import { Stepper } from '@/components/ui-x/Stepper'
import { apiFetch } from '@/lib/api'
import { byId } from '@/lib/reports'
import { useApi } from '@/lib/use-api'

const NO_ATTENDEES: SessionAttendee[] = []

export default function Aulas() {
  const { sessions, workouts, users, reload } = useBox()
  const now = useMemo(() => new Date(), [])
  const [day, setDay] = useState(() => isoDate(new Date()))
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [assigning, setAssigning] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const userById = useMemo(() => byId(users), [users])
  const workoutById = useMemo(() => byId(workouts), [workouts])
  const daySessions = useMemo(() => sessionsOn(sessions, day), [sessions, day])
  const selected =
    daySessions.find((session) => session.id === selectedId) ?? daySessions[0]

  const attendees = useApi<SessionAttendee[]>(
    selected ? `/workout-sessions/${selected.id}/attendees` : null,
    NO_ATTENDEES
  )

  const confirmedIds = new Set(
    attendees.data.map((attendee) => attendee.userId)
  )
  const candidates = users.filter(
    (user) => user.isActive && !confirmedIds.has(user.id)
  )
  const closed = selected ? checkinState(selected, now) === 'closed' : true

  async function assignWorkout(workoutId: string) {
    setError(null)
    try {
      await Promise.all(
        daySessions.map((session) =>
          apiFetch(`/workout-sessions/${session.id}`, {
            method: 'PATCH',
            body: JSON.stringify({ workoutId }),
          })
        )
      )
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Não foi possível atribuir o WOD'
      )
    }
    await reload.sessions()
  }

  async function changeCapacity(capacity: number) {
    if (!selected) return
    setBusy(true)
    setError(null)
    try {
      await apiFetch(`/workout-sessions/${selected.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ capacity }),
      })
      await reload.sessions()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Não foi possível mudar as vagas'
      )
    } finally {
      setBusy(false)
    }
  }

  async function addAttendee(user: User) {
    if (!selected) return
    setBusy(true)
    setError(null)
    try {
      await apiFetch(`/workout-sessions/${selected.id}/attendees`, {
        method: 'POST',
        body: JSON.stringify({ userId: user.id }),
      })
      await Promise.all([reload.sessions(), attendees.reload()])
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível confirmar o aluno'
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <Page
      eyebrow="Aulas com data · presença e vagas"
      title={`Aulas de ${dayAndMonth(dayDate(day))}`}
      actions={
        <>
          <div className="flex h-12 items-center gap-0.5 rounded-md border border-hairline bg-panel px-1.5">
            <IconButton
              aria-label="Dia anterior"
              onClick={() => setDay(isoDate(addDays(dayDate(day), -1)))}
            >
              <ChevronLeftIcon />
            </IconButton>
            <span className="px-3 text-md font-semibold">
              {WEEK_DAY_LABEL[weekDayOf(dayDate(day))]},{' '}
              {dayAndMonth(dayDate(day))}
            </span>
            <IconButton
              aria-label="Dia seguinte"
              onClick={() => setDay(isoDate(addDays(dayDate(day), 1)))}
            >
              <ChevronRightIcon />
            </IconButton>
          </div>
          <Button
            disabled={daySessions.length === 0}
            onClick={() => setAssigning(true)}
          >
            Atribuir WOD ao dia
          </Button>
        </>
      }
    >
      {error ? <p className="text-base text-accent-text">{error}</p> : null}

      {daySessions.length === 0 ? (
        <Panel className="gap-1.5">
          <p className="text-xl font-bold">Nenhuma aula nesse dia</p>
          <p className="text-base text-ink-2">
            Publique as aulas do dia a partir do Dashboard ou da grade de
            horários.
          </p>
        </Panel>
      ) : (
        <div className="grid min-h-0 flex-1 grid-cols-[1fr_420px] gap-4">
          <HairlineTable
            columns="80px 1fr 120px 120px 110px"
            head={['Hora', 'Coach · WOD', 'Presença', 'Vagas', '']}
            className="min-h-0"
          >
            {daySessions.map((session) => {
              const wod = workoutById.get(session.workoutId)
              const isSelected = session.id === selected?.id
              return (
                <HairlineRow
                  key={session.id}
                  selected={isSelected}
                  onClick={() => setSelectedId(session.id)}
                >
                  <span className="font-bold">{hourLabel(session.time)}</span>
                  <span className="truncate">
                    {session.coach
                      ? fullName(
                          session.coach.firstName,
                          session.coach.lastName
                        )
                      : 'Sem coach'}
                    {wod ? ` · ${parseWod(wod.wod).name}` : ''}
                  </span>
                  <span
                    className={
                      isFull(session)
                        ? 'text-base text-highlight'
                        : 'text-base text-ink-2'
                    }
                  >
                    {isFull(session)
                      ? 'lotada'
                      : `${session.occupied} confirmados`}
                  </span>
                  <span className="text-base text-ink-2">
                    {session.occupied}/{session.capacity}
                  </span>
                  <span
                    className={
                      isSelected
                        ? 'text-sm font-semibold text-accent-text'
                        : 'text-sm text-ink-3'
                    }
                  >
                    {isSelected ? 'Selecionada' : 'Ver lista'}
                  </span>
                </HairlineRow>
              )
            })}
          </HairlineTable>

          {selected ? (
            <Panel className="min-h-0 gap-4 overflow-hidden p-5.5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="section-label">
                    {WEEK_DAY_LABEL[weekDayOf(dayDate(day))]} ·{' '}
                    {hourLabel(selected.time)}
                  </p>
                  <p className="mt-1.5 flex items-baseline gap-1.5">
                    <span className="font-display text-heading tracking-heading">
                      {selected.occupied}
                    </span>
                    <span className="text-lg font-bold text-ink-3">
                      / {selected.capacity}
                    </span>
                  </p>
                </div>
                <Stepper
                  value={selected.capacity}
                  min={Math.max(1, selected.occupied)}
                  onChange={(capacity) => void changeCapacity(capacity)}
                />
              </div>

              <div className="flex items-center gap-2.5 rounded-md bg-surface px-3.5 py-3">
                <ClockIcon className="size-4.5 text-ink-2" />
                <span className="text-base text-ink-2">
                  {closed
                    ? `Check-in do aluno fechou às ${hourLabel(selected.time)} · você ainda pode confirmar quem esqueceu`
                    : `Check-in fecha às ${hourLabel(selected.time)} · abriu ${clockLabel(opensAt(selected))}`}
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className="section-label">Confirmados</span>
                <Select
                  value=""
                  onValueChange={(userId) => {
                    const user = userById.get(userId)
                    if (user) void addAttendee(user)
                  }}
                  disabled={busy}
                >
                  <SelectTrigger className="h-9 w-45 text-sm">
                    <SelectValue placeholder="Adicionar aluno" />
                  </SelectTrigger>
                  <SelectContent>
                    {candidates.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {fullName(user.firstName, user.lastName)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
                {attendees.data.map((entry) => (
                  <div
                    key={entry.userId}
                    className="flex items-center gap-3 border-t border-hairline py-2.5"
                  >
                    <Avatar
                      label={initials(entry.firstName, entry.lastName)}
                      size={32}
                    />
                    <span className="flex-1 text-md">
                      {fullName(entry.firstName, entry.lastName)}
                    </span>
                    <span className="text-xs text-ink-3">
                      {clockLabel(new Date(entry.checkedInAt))}
                    </span>
                  </div>
                ))}
                {attendees.data.length === 0 ? (
                  <p className="border-t border-hairline pt-3 text-base text-ink-2">
                    Ninguém confirmou essa aula ainda.
                  </p>
                ) : null}
              </div>

              <p className="border-t border-hairline pt-3.5 text-sm text-ink-3">
                Presença é gerada pelos check-ins do app. Coach pode adicionar
                quem esqueceu.
              </p>
            </Panel>
          ) : null}
        </div>
      )}

      <PickerDialog
        open={assigning}
        title={`Atribuir WOD às aulas de ${dayAndMonth(dayDate(day))}`}
        description={`Troca o treino das ${daySessions.length} aulas do dia.`}
        placeholder="Escolha o WOD"
        options={workouts.map((workout) => ({
          value: workout.id,
          label: parseWod(workout.wod).name,
        }))}
        confirmLabel="Atribuir"
        onOpenChange={setAssigning}
        onConfirm={assignWorkout}
      />
    </Page>
  )
}
