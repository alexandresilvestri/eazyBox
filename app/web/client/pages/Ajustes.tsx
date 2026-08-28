import { useMemo } from 'react'
import { CHECKIN_WINDOW_HOURS } from '@eazybox/shared'
import { useBox } from '@/box-context'
import { Page } from '@/components/ui-x/Page'
import { Panel } from '@/components/ui-x/Panel'
import { byId } from '@/lib/reports'

const OPEN_DECISIONS = [
  {
    title: 'Ajustes persistidos',
    detail:
      'Nome da box, fuso e as regras ao lado ainda não têm tabela — hoje vivem no código.',
  },
  {
    title: 'Fila de espera quando lotar',
    detail:
      'Fora do MVP: precisa decidir prioridade e prazo para assumir a vaga.',
  },
  {
    title: 'Cancelamento com prazo',
    detail:
      'Hoje o aluno desfaz o check-in a qualquer momento; nenhuma regra de prazo é aplicada.',
  },
  {
    title: 'Foto de perfil',
    detail: 'Sem campo de avatar nem storage definido; o painel usa iniciais.',
  },
  {
    title: 'Coach desfazendo check-in de aluno',
    detail:
      'A política de update segue restrita à própria linha: o coach adiciona, mas não remove.',
  },
]

export default function Ajustes() {
  const { schedule, sessions } = useBox()

  const rules = useMemo(() => {
    const capacities = [...new Set(schedule.map((slot) => slot.capacity))].sort(
      (a, b) => a - b
    )
    const slots = byId(schedule)
    const adjusted = sessions.filter((session) => {
      const slot = slots.get(session.workoutScheduleId)
      return slot && slot.capacity !== session.capacity
    }).length

    return [
      {
        title: 'Vagas por aula',
        detail: 'Definidas por horário na grade',
        value:
          capacities.length === 0
            ? '—'
            : [...new Set([capacities[0], capacities.at(-1)])].join('–'),
      },
      {
        title: 'Janela de check-in',
        detail: 'Horas antes do início da aula',
        value: `${CHECKIN_WINDOW_HOURS}h`,
      },
      {
        title: 'Aulas com vagas ajustadas',
        detail: 'Diferentes da grade fixa',
        value: String(adjusted),
      },
    ]
  }, [schedule, sessions])

  return (
    <Page eyebrow="Regras que valem para toda a box" title="Ajustes">
      <div className="grid grid-cols-2 items-start gap-4">
        <Panel className="gap-4.5 p-5.5">
          <span className="section-label">Check-in</span>
          {rules.map((rule) => (
            <div
              key={rule.title}
              className="flex items-center justify-between gap-4 border-t border-hairline pt-4"
            >
              <div>
                <p className="text-lg">{rule.title}</p>
                <p className="mt-0.5 text-sm text-ink-3">{rule.detail}</p>
              </div>
              <p className="text-lg font-bold">{rule.value}</p>
            </div>
          ))}
        </Panel>

        <Panel className="gap-3.5 p-5.5">
          <span className="section-label">Pendências para você decidir</span>
          <div className="flex flex-col">
            {OPEN_DECISIONS.map((item) => (
              <div
                key={item.title}
                className="flex items-start gap-3 border-t border-hairline py-3"
              >
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-highlight" />
                <div>
                  <p className="text-md">{item.title}</p>
                  <p className="mt-0.5 text-sm text-ink-3">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </Page>
  )
}
