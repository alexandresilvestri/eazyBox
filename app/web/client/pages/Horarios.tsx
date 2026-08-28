import { useMemo, useState } from 'react'
import {
  DEFAULT_CAPACITY,
  fullName,
  hourLabel,
  WEEK_DAY_LABEL,
  WEEK_DAYS,
} from '@eazybox/shared'
import type { WeekDay, WorkoutSchedule } from '@eazybox/shared'
import { useBox } from '@/box-context'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Page } from '@/components/ui-x/Page'
import { Panel } from '@/components/ui-x/Panel'
import { Stepper } from '@/components/ui-x/Stepper'
import { apiFetch } from '@/lib/api'
import { byId, capacityOf } from '@/lib/reports'
import { cn } from '@/lib/utils'

const NO_COACH = 'none'

type Editing = {
  slot: WorkoutSchedule | null
  weekDay: WeekDay
  time: string
  capacity: number
  coachId: string
}

export default function Horarios() {
  const { schedule, users, reload } = useBox()
  const [defaultCapacity, setDefaultCapacity] = useState(DEFAULT_CAPACITY)
  const [editing, setEditing] = useState<Editing | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const coaches = users.filter((user) => user.isCoach)
  const userById = useMemo(() => byId(users), [users])
  const times = useMemo(
    () => [...new Set(schedule.map((slot) => slot.time))].sort(),
    [schedule]
  )
  const slots = useMemo(
    () =>
      new Map(schedule.map((slot) => [`${slot.weekDay} ${slot.time}`, slot])),
    [schedule]
  )

  function open(weekDay: WeekDay, time: string) {
    const slot = slots.get(`${weekDay} ${time}`) ?? null
    setError(null)
    setEditing({
      slot,
      weekDay,
      time: hourLabel(time),
      capacity: slot?.capacity ?? defaultCapacity,
      coachId: slot?.coachId ?? NO_COACH,
    })
  }

  async function save() {
    if (!editing) return
    setSaving(true)
    setError(null)
    const body = {
      weekDay: editing.weekDay,
      time: editing.time,
      capacity: editing.capacity,
      coachId: editing.coachId === NO_COACH ? null : editing.coachId,
    }
    try {
      await apiFetch(
        editing.slot
          ? `/workout-schedule/${editing.slot.id}`
          : '/workout-schedule',
        { method: editing.slot ? 'PATCH' : 'POST', body: JSON.stringify(body) }
      )
      await reload.schedule()
      setEditing(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível salvar')
    } finally {
      setSaving(false)
    }
  }

  async function remove() {
    if (!editing?.slot) return
    setSaving(true)
    setError(null)
    try {
      await apiFetch(`/workout-schedule/${editing.slot.id}`, {
        method: 'DELETE',
      })
      await reload.schedule()
      setEditing(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível remover')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Page
      eyebrow="Grade fixa · vale para todas as semanas"
      title="Horários da semana"
      actions={
        <>
          <div className="flex h-12 items-center gap-3 rounded-md border border-hairline bg-panel pr-2 pl-4">
            <span className="text-base text-ink-2">Vagas padrão</span>
            <Stepper value={defaultCapacity} onChange={setDefaultCapacity} />
          </div>
          <Button onClick={() => open(WEEK_DAYS[0], times[0] ?? '06:00')}>
            Novo horário
          </Button>
        </>
      }
    >
      <Panel className="min-h-0 flex-1 gap-3.5 p-5.5">
        <div className="grid grid-cols-[86px_repeat(7,1fr)] gap-2.5 text-2xs font-semibold tracking-label text-ink-3 uppercase">
          <span />
          {WEEK_DAYS.map((weekDay) => (
            <span key={weekDay}>{WEEK_DAY_LABEL[weekDay]}</span>
          ))}
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-[86px_repeat(7,1fr)] gap-2.5">
          {times.map((time) => (
            <div
              key={time}
              className="col-span-8 grid grid-cols-subgrid gap-2.5"
            >
              <span className="flex items-center text-md font-bold">
                {hourLabel(time)}
              </span>
              {WEEK_DAYS.map((weekDay) => {
                const slot = slots.get(`${weekDay} ${time}`)
                const coach = slot?.coachId
                  ? userById.get(slot.coachId)
                  : undefined
                return (
                  <button
                    key={`${weekDay}-${time}`}
                    type="button"
                    onClick={() => open(weekDay, time)}
                    className={cn(
                      'flex flex-col items-start justify-center gap-0.5 rounded-md px-3.5 text-left transition-colors',
                      slot
                        ? 'border border-hairline bg-surface hover:border-hairline-strong'
                        : 'border border-dashed border-hairline text-ink-3 hover:border-hairline-strong hover:text-ink-1'
                    )}
                  >
                    {slot ? (
                      <>
                        <span className="text-base font-semibold">
                          {coach?.firstName ?? 'Sem coach'}
                        </span>
                        <span className="text-xs text-ink-3">
                          {slot.capacity} vagas
                        </span>
                      </>
                    ) : (
                      <span className="w-full text-center text-xl">+</span>
                    )}
                  </button>
                )
              })}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-5 border-t border-hairline pt-1.5">
          <span className="text-sm text-ink-3">
            {schedule.length} horários ativos · {capacityOf(schedule)} vagas por
            semana
          </span>
        </div>
      </Panel>

      <Dialog
        open={editing !== null}
        onOpenChange={(next) => !next && setEditing(null)}
      >
        {editing && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editing.slot ? 'Editar horário' : 'Novo horário'}
              </DialogTitle>
              <DialogDescription>
                {WEEK_DAY_LABEL[editing.weekDay]} · vale para todas as semanas
              </DialogDescription>
            </DialogHeader>

            <label className="flex flex-col gap-2">
              <span className="field-label">Dia</span>
              <Select
                value={editing.weekDay}
                onValueChange={(value) =>
                  setEditing({ ...editing, weekDay: value as WeekDay })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WEEK_DAYS.map((weekDay) => (
                    <SelectItem key={weekDay} value={weekDay}>
                      {WEEK_DAY_LABEL[weekDay]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>

            <label className="flex flex-col gap-2">
              <span className="field-label">Hora</span>
              <Input
                type="time"
                value={editing.time}
                onChange={(event) =>
                  setEditing({ ...editing, time: event.target.value })
                }
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="field-label">Coach</span>
              <Select
                value={editing.coachId}
                onValueChange={(value) =>
                  setEditing({ ...editing, coachId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_COACH}>Sem coach</SelectItem>
                  {coaches.map((coach) => (
                    <SelectItem key={coach.id} value={coach.id}>
                      {fullName(coach.firstName, coach.lastName)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>

            <div className="flex items-center justify-between gap-4">
              <span className="text-md">Vagas</span>
              <Stepper
                value={editing.capacity}
                onChange={(capacity) => setEditing({ ...editing, capacity })}
              />
            </div>

            {error ? (
              <p className="text-base text-accent-text">{error}</p>
            ) : null}

            <div className="flex gap-2.5">
              {editing.slot ? (
                <Button
                  variant="outline"
                  className="flex-1"
                  disabled={saving}
                  onClick={() => void remove()}
                >
                  Remover
                </Button>
              ) : null}
              <Button
                className="flex-1"
                disabled={saving}
                onClick={() => void save()}
              >
                Salvar
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </Page>
  )
}
