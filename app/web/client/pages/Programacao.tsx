import { useState } from 'react'
import { shortDate, summarize } from '@eazybox/shared'
import type { Workout } from '@eazybox/shared'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { apiFetch } from '@/lib/api'
import { useApi } from '@/lib/use-api'

export function Programacao() {
  const { data: workouts, reload } = useApi<Workout[]>('/workouts', [])
  const [warmUp, setWarmUp] = useState('')
  const [skill, setSkill] = useState('')
  const [wod, setWod] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setError(null)
    setSaving(true)
    try {
      await apiFetch('/workouts', {
        method: 'POST',
        body: JSON.stringify({
          warmUp: warmUp.trim() || null,
          skill: skill.trim() || null,
          wod: wod.trim(),
        }),
      })
      setWarmUp('')
      setSkill('')
      setWod('')
      await reload()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Band
      title="Programação"
      subtitle="O que você escreve aqui é exatamente o que o aluno lê no app. As quebras de linha são preservadas."
    >
      <div className="flex flex-col gap-6">
        <SectionCard
          title="Novo treino"
          action={
            <Button
              onClick={() => void save()}
              disabled={saving || !wod.trim()}
            >
              {saving ? 'Salvando...' : 'Salvar treino'}
            </Button>
          }
        >
          {error && <InlineAlert>{error}</InlineAlert>}

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="warmup">Warmup</Label>
                <Textarea
                  id="warmup"
                  value={warmUp}
                  onChange={(event) => setWarmUp(event.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="skill">Skill</Label>
                <Textarea
                  id="skill"
                  value={skill}
                  onChange={(event) => setSkill(event.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="wod">WOD</Label>
                <Textarea
                  id="wod"
                  value={wod}
                  onChange={(event) => setWod(event.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-5 bg-paper p-5">
              <span className="eyebrow">Como o aluno vê</span>
              {!warmUp && !skill && !wod ? (
                <p className="text-xs text-ink-3">
                  Escreva o treino ao lado para ver o quadro aqui.
                </p>
              ) : (
                <>
                  <BoardSection label="Warmup">{warmUp}</BoardSection>
                  <BoardSection label="Skill">{skill}</BoardSection>
                  <BoardSection label="WOD" emphasis>
                    {wod}
                  </BoardSection>
                </>
              )}
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Treinos"
          description={`${workouts.length} treino(s) cadastrado(s)`}
        >
          {workouts.length === 0 ? (
            <p className="text-xs text-ink-2">
              Nenhum treino cadastrado ainda.
            </p>
          ) : (
            <HairlineTable columns={['auto', '140px', '160px']}>
              <thead>
                <HairlineTr>
                  <HairlineTh>WOD</HairlineTh>
                  <HairlineTh>Seções</HairlineTh>
                  <HairlineTh>Criado</HairlineTh>
                </HairlineTr>
              </thead>
              <tbody>
                {workouts.map((workout) => (
                  <HairlineTr key={workout.id}>
                    <HairlineTd className="font-mono text-xs">
                      {summarize(workout.wod)}
                    </HairlineTd>
                    <HairlineTd className="text-xs text-ink-2">
                      {[
                        workout.warmUp && 'Warmup',
                        workout.skill && 'Skill',
                        'WOD',
                      ]
                        .filter(Boolean)
                        .join(' · ')}
                    </HairlineTd>
                    <HairlineTd className="text-xs text-ink-2">
                      {shortDate(workout.createdAt)}
                    </HairlineTd>
                  </HairlineTr>
                ))}
              </tbody>
            </HairlineTable>
          )}
        </SectionCard>
      </div>
    </Band>
  )
}
