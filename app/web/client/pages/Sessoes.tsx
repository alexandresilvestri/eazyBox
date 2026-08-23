import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import type {
  Checkin,
  Workout,
  WorkoutSchedule,
  WorkoutSession,
} from '@eazybox/shared'
import {
  WEEK_DAY_LABEL,
  countBySession,
  isoDate,
  shortDate,
  startOfWeek,
  summarize,
} from '@eazybox/shared'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { BoardSection } from '@/components/ui-x/BoardSection'
import {
  HairlineTable,
  HairlineTd,
  HairlineTh,
  HairlineTr,
} from '@/components/ui-x/HairlineTable'
import { InlineAlert } from '@/components/ui-x/InlineAlert'
import { SectionCard } from '@/components/ui-x/SectionCard'
import { TallyMeter } from '@/components/ui-x/TallyMeter'
import { apiFetch } from '@/lib/api'
import { useApi } from '@/lib/use-api'

export function Sessoes() {
  const [params, setParams] = useSearchParams()
  const from = useMemo(() => isoDate(startOfWeek(new Date())), [])

  const { data: sessions, reload } = useApi<WorkoutSession[]>(
    `/workout-sessions?from=${from}`,
    []
  )
  const { data: schedule } = useApi<WorkoutSchedule[]>('/workout-schedule', [])
  const { data: workouts } = useApi<Workout[]>('/workouts', [])
  const { data: checkins } = useApi<Checkin[]>('/checkins', [])

  const [slotId, setSlotId] = useState('')
  const [workoutId, setWorkoutId] = useState('')
  const [sessionDate, setSessionDate] = useState(isoDate(new Date()))
  const [error, setError] = useState<string | null>(null)

  const workoutById = useMemo(
    () => new Map(workouts.map((workout) => [workout.id, workout])),
    [workouts]
  )

  const counts = useMemo(() => countBySession(checkins), [checkins])

  const selected = sessions.find(
    (session) => session.id === params.get('sessao')
  )
  const selectedWorkout = selected && workoutById.get(selected.workoutId)

  const create = async () => {
    setError(null)
    try {
      await apiFetch('/workout-sessions', {
        method: 'POST',
        body: JSON.stringify({
          workoutScheduleId: slotId,
          workoutId,
          sessionDate,
        }),
      })
      await reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado')
    }
  }

  return (
    <Band
      title="Sessões"
      subtitle="Cada sessão liga um horário da grade a um treino em uma data."
    >
      <div className="flex flex-col gap-6">
        <SectionCard title="Nova sessão">
          {error && <InlineAlert>{error}</InlineAlert>}

          <div className="flex flex-wrap items-end gap-4">
            <div className="flex w-52 flex-col gap-1.5">
              <Label htmlFor="slot">Horário</Label>
              <Select value={slotId} onValueChange={setSlotId}>
                <SelectTrigger id="slot">
                  <SelectValue placeholder="Escolha" />
                </SelectTrigger>
                <SelectContent>
                  {schedule.map((slot) => (
                    <SelectItem key={slot.id} value={slot.id}>
                      {WEEK_DAY_LABEL[slot.weekDay]} {slot.time.slice(0, 5)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex w-72 flex-col gap-1.5">
              <Label htmlFor="workout">Treino</Label>
              <Select value={workoutId} onValueChange={setWorkoutId}>
                <SelectTrigger id="workout">
                  <SelectValue placeholder="Escolha" />
                </SelectTrigger>
                <SelectContent>
                  {workouts.map((workout) => (
                    <SelectItem key={workout.id} value={workout.id}>
                      {summarize(workout.wod)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex w-44 flex-col gap-1.5">
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={sessionDate}
                onChange={(event) => setSessionDate(event.target.value)}
              />
            </div>

            <Button
              onClick={() => void create()}
              disabled={!slotId || !workoutId}
            >
              Criar sessão
            </Button>
          </div>
        </SectionCard>

        <SectionCard
          title="Agenda"
          description={`${sessions.length} sessão(ões) a partir de ${shortDate(from)}`}
        >
          {sessions.length === 0 ? (
            <p className="text-xs text-ink-2">Nenhuma sessão criada ainda.</p>
          ) : (
            <HairlineTable columns={['120px', '90px', '80px', 'auto', '140px']}>
              <thead>
                <HairlineTr>
                  <HairlineTh>Data</HairlineTh>
                  <HairlineTh>Dia</HairlineTh>
                  <HairlineTh>Hora</HairlineTh>
                  <HairlineTh>WOD</HairlineTh>
                  <HairlineTh>Check-ins</HairlineTh>
                </HairlineTr>
              </thead>
              <tbody>
                {sessions.map((session) => (
                  <HairlineTr
                    key={session.id}
                    onClick={() => setParams({ sessao: session.id })}
                  >
                    <HairlineTd className="text-xs">
                      {shortDate(session.sessionDate)}
                    </HairlineTd>
                    <HairlineTd className="text-xs text-ink-2">
                      {WEEK_DAY_LABEL[session.weekDay]}
                    </HairlineTd>
                    <HairlineTd className="display-numeral text-lg">
                      {session.time.slice(0, 5)}
                    </HairlineTd>
                    <HairlineTd className="font-mono text-xs">
                      {summarize(workoutById.get(session.workoutId)?.wod ?? '')}
                    </HairlineTd>
                    <HairlineTd>
                      <TallyMeter count={counts.get(session.id) ?? 0} />
                    </HairlineTd>
                  </HairlineTr>
                ))}
              </tbody>
            </HairlineTable>
          )}
        </SectionCard>
      </div>

      <Dialog
        open={Boolean(selected)}
        onOpenChange={(open) => !open && setParams({})}
      >
        <DialogContent className="sm:max-w-2xl">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {WEEK_DAY_LABEL[selected.weekDay]} ·{' '}
                  {shortDate(selected.sessionDate)} ·{' '}
                  {selected.time.slice(0, 5)}
                </DialogTitle>
                <DialogDescription>
                  Quadro publicado para esta sessão.
                </DialogDescription>
              </DialogHeader>

              <TallyMeter size="detail" count={counts.get(selected.id) ?? 0} />

              <div className="flex max-h-[60dvh] flex-col gap-5 overflow-y-auto">
                <BoardSection label="Warmup">
                  {selectedWorkout?.warmUp}
                </BoardSection>
                <BoardSection label="Skill">
                  {selectedWorkout?.skill}
                </BoardSection>
                <BoardSection label="WOD" emphasis>
                  {selectedWorkout?.wod}
                </BoardSection>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Band>
  )
}
