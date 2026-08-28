import { useMemo, useState } from 'react'
import { isoDate, parseWod } from '@eazybox/shared'
import type { Workout } from '@eazybox/shared'
import { useBox } from '@/box-context'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { HairlineRow, HairlineTable } from '@/components/ui-x/HairlineTable'
import { Page } from '@/components/ui-x/Page'
import { Panel } from '@/components/ui-x/Panel'
import { SearchInput } from '@/components/ui-x/SearchInput'
import { apiFetch } from '@/lib/api'
import { dayLabel, lastUsedByWorkout } from '@/lib/reports'

type Draft = { warmUp: string; skill: string; wod: string }

const draftOf = (workout: Workout | null): Draft => ({
  warmUp: workout?.warmUp ?? '',
  skill: workout?.skill ?? '',
  wod: workout?.wod ?? '',
})

const payloadOf = (draft: Draft) => ({
  warmUp: draft.warmUp.trim() || null,
  skill: draft.skill.trim() || null,
  wod: draft.wod.trim(),
})

export default function Wods() {
  const { workouts, sessions, reload } = useBox()
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [draft, setDraft] = useState<Draft>(draftOf(null))
  const [saving, setSaving] = useState(false)

  const today = useMemo(() => isoDate(new Date()), [])
  const lastUsed = useMemo(() => lastUsedByWorkout(sessions), [sessions])
  const parsed = useMemo(
    () =>
      new Map(workouts.map((workout) => [workout.id, parseWod(workout.wod)])),
    [workouts]
  )

  const term = query.trim().toLowerCase()
  const visible = workouts.filter((workout) =>
    workout.wod.toLowerCase().includes(term)
  )

  function select(workout: Workout) {
    setSelectedId(workout.id)
    setDraft(draftOf(workout))
  }

  async function save(id: string | null) {
    if (!draft.wod.trim()) return
    setSaving(true)
    try {
      const saved = id
        ? await apiFetch<Workout>(`/workouts/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(payloadOf(draft)),
          })
        : await apiFetch<Workout>('/workouts', {
            method: 'POST',
            body: JSON.stringify(payloadOf(draft)),
          })
      setSelectedId(saved.id)
      await reload.workouts()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Page
      eyebrow={`${workouts.length} treinos cadastrados`}
      title="Biblioteca de WODs"
      actions={
        <>
          <SearchInput
            value={query}
            placeholder="Buscar WOD…"
            onChange={setQuery}
            className="w-65"
          />
          <Button
            onClick={() => {
              setSelectedId(null)
              setDraft(draftOf(null))
            }}
          >
            Novo WOD
          </Button>
        </>
      }
    >
      <div className="grid min-h-0 flex-1 grid-cols-[1fr_400px] gap-4">
        <HairlineTable
          columns="150px 1fr 200px 90px"
          head={['Nome', 'WOD', 'Skill', 'Usado em']}
          className="min-h-0"
        >
          {visible.map((workout) => {
            const wod = parsed.get(workout.id)
            return (
              <HairlineRow
                key={workout.id}
                selected={workout.id === selectedId}
                onClick={() => select(workout)}
              >
                <span className="font-bold">{wod?.name}</span>
                <span className="truncate text-ink-2">
                  {[wod?.scheme, ...(wod?.movements ?? [])]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
                <span className="truncate text-base text-ink-2">
                  {workout.skill ?? '—'}
                </span>
                <span className="text-base text-ink-3">
                  {dayLabel(lastUsed.get(workout.id), today, 'Nunca')}
                </span>
              </HairlineRow>
            )
          })}
        </HairlineTable>

        <Panel className="min-h-0 gap-4.5 overflow-y-auto p-5.5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="section-label">
                {selectedId ? 'Editando' : 'Novo treino'}
              </p>
              <p className="mt-1.5 font-display text-heading tracking-heading">
                {parseWod(draft.wod).name || 'Sem nome'}
              </p>
            </div>
            {selectedId && lastUsed.get(selectedId) === today ? (
              <Badge tone="highlight">Em uso hoje</Badge>
            ) : null}
          </div>

          <label className="flex flex-col gap-2">
            <span className="field-label">Aquecimento</span>
            <Textarea
              value={draft.warmUp}
              rows={2}
              onChange={(event) =>
                setDraft({ ...draft, warmUp: event.target.value })
              }
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="field-label">Skill</span>
            <Input
              value={draft.skill}
              onChange={(event) =>
                setDraft({ ...draft, skill: event.target.value })
              }
            />
          </label>

          <label className="flex flex-1 flex-col gap-2">
            <span className="field-label">WOD</span>
            <Textarea
              value={draft.wod}
              rows={7}
              placeholder={'Nome\nEsquema\nMovimentos'}
              onChange={(event) =>
                setDraft({ ...draft, wod: event.target.value })
              }
            />
          </label>

          <div className="flex gap-2.5">
            <Button
              variant="outline"
              className="flex-1"
              disabled={saving || !draft.wod.trim()}
              onClick={() => void save(null)}
            >
              Duplicar
            </Button>
            <Button
              variant="light"
              className="flex-1"
              disabled={saving || !draft.wod.trim()}
              onClick={() => void save(selectedId)}
            >
              Salvar
            </Button>
          </div>
        </Panel>
      </div>
    </Page>
  )
}
