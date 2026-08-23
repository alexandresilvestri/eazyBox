import { useState } from 'react'
import { IconTrash } from '@tabler/icons-react'
import { WEEK_DAYS, WEEK_DAY_LABEL } from '@eazybox/shared'
import type { WeekDay, WorkoutSchedule } from '@eazybox/shared'
import { Button } from '@/components/ui/button'
import { IconButton } from '@/components/ui/icon-button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Band } from '@/components/ui-x/Band'
import { InlineAlert } from '@/components/ui-x/InlineAlert'
import { SectionCard } from '@/components/ui-x/SectionCard'
import { apiFetch } from '@/lib/api'
import { useApi } from '@/lib/use-api'

export function Grade() {
  const { data: schedule, reload } = useApi<WorkoutSchedule[]>(
    '/workout-schedule',
    []
  )
  const [weekDay, setWeekDay] = useState<WeekDay>('monday')
  const [time, setTime] = useState('06:00')
  const [error, setError] = useState<string | null>(null)

  const create = async () => {
    setError(null)
    try {
      await apiFetch('/workout-schedule', {
        method: 'POST',
        body: JSON.stringify({ weekDay, time }),
      })
      await reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado')
    }
  }

  const remove = async (id: string) => {
    setError(null)
    try {
      await apiFetch(`/workout-schedule/${id}`, { method: 'DELETE' })
      await reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado')
    }
  }

  return (
    <Band
      title="Grade semanal"
      subtitle="Os horários fixos do box. Cada sessão do dia nasce de um horário desta grade."
    >
      <div className="flex flex-col gap-6">
        <SectionCard title="Novo horário">
          {error && <InlineAlert>{error}</InlineAlert>}

          <div className="flex flex-wrap items-end gap-4">
            <div className="flex w-44 flex-col gap-1.5">
              <Label htmlFor="weekday">Dia</Label>
              <Select
                value={weekDay}
                onValueChange={(value) => setWeekDay(value as WeekDay)}
              >
                <SelectTrigger id="weekday">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WEEK_DAYS.map((day) => (
                    <SelectItem key={day} value={day}>
                      {WEEK_DAY_LABEL[day]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex w-40 flex-col gap-1.5">
              <Label htmlFor="time">Hora</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(event) => setTime(event.target.value)}
              />
            </div>

            <Button onClick={() => void create()}>Adicionar</Button>
          </div>
        </SectionCard>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {WEEK_DAYS.map((day) => {
            const slots = schedule
              .filter((slot) => slot.weekDay === day)
              .sort((a, b) => a.time.localeCompare(b.time))

            return (
              <SectionCard key={day} title={WEEK_DAY_LABEL[day]}>
                {slots.length === 0 ? (
                  <p className="text-xs text-ink-3">Sem horários.</p>
                ) : (
                  <ul className="flex flex-col gap-1">
                    {slots.map((slot) => (
                      <li
                        key={slot.id}
                        className="flex items-center justify-between gap-2 border-b border-hairline pb-1 last:border-b-0"
                      >
                        <span className="display-numeral text-xl text-ink-1">
                          {slot.time.slice(0, 5)}
                        </span>
                        <IconButton
                          aria-label={`Remover ${WEEK_DAY_LABEL[day]} ${slot.time}`}
                          size={28}
                          onClick={() => void remove(slot.id)}
                        >
                          <IconTrash className="size-3.5" />
                        </IconButton>
                      </li>
                    ))}
                  </ul>
                )}
              </SectionCard>
            )
          })}
        </div>
      </div>
    </Band>
  )
}
