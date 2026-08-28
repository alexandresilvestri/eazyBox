import { useState } from 'react'
import { fullName, initials } from '@eazybox/shared'
import type { User } from '@eazybox/shared'
import { useBox } from '@/box-context'
import { Button } from '@/components/ui/button'
import { CheckIcon, CloseIcon } from '@/components/ui/icons'
import { Avatar } from '@/components/ui-x/Avatar'
import { Page } from '@/components/ui-x/Page'
import { Panel } from '@/components/ui-x/Panel'
import { PickerDialog } from '@/components/ui-x/PickerDialog'
import { apiFetch } from '@/lib/api'
import { occupancyRate } from '@/lib/reports'
import { cn } from '@/lib/utils'

const PERMISSIONS = [
  { label: 'Criar e editar WODs', allowed: true },
  { label: 'Atribuir WOD às aulas do dia', allowed: true },
  { label: 'Ver presença e ajustar vagas do dia', allowed: true },
  { label: 'Confirmar aluno que esqueceu o check-in', allowed: true },
  { label: 'Cadastrar ou desativar clientes', allowed: false },
  { label: 'Alterar a grade de horários', allowed: false },
]

export default function Coaches() {
  const { users, sessions, schedule, reload } = useBox()
  const [promoting, setPromoting] = useState(false)
  const [busy, setBusy] = useState(false)

  const coaches = users.filter((user) => user.isCoach)
  const members = users.filter(
    (user) => user.isActive && !user.isCoach && !user.isAdmin
  )

  async function setCoachFlag(user: User, isCoach: boolean) {
    setBusy(true)
    try {
      await apiFetch(`/users/${user.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isCoach }),
      })
      await reload.users()
    } finally {
      setBusy(false)
    }
  }

  return (
    <Page
      eyebrow="Quem pode publicar WOD e ver presença"
      title="Coaches"
      actions={
        <Button onClick={() => setPromoting(true)}>
          Promover aluno a coach
        </Button>
      }
    >
      <div className="grid grid-cols-3 gap-4">
        {coaches.map((coach) => {
          const weekly = schedule.filter((slot) => slot.coachId === coach.id)
          const owned = sessions.filter(
            (session) => session.coachId === coach.id
          )
          return (
            <Panel key={coach.id} className="gap-4.5 p-5.5">
              <div className="flex items-center gap-3.5">
                <Avatar
                  label={initials(coach.firstName, coach.lastName)}
                  size={52}
                />
                <div className="min-w-0">
                  <p className="text-xl font-bold">
                    {fullName(coach.firstName, coach.lastName)}
                  </p>
                  <p className="truncate text-base text-ink-2">{coach.email}</p>
                </div>
              </div>

              <div className="flex gap-6">
                <div>
                  <p className="text-heading font-bold tracking-heading">
                    {weekly.length}
                  </p>
                  <p className="text-sm text-ink-3">aulas/semana</p>
                </div>
                <div>
                  <p className="text-heading font-bold tracking-heading">
                    {Math.round(occupancyRate(owned) * 100)}%
                  </p>
                  <p className="text-sm text-ink-3">ocupação média</p>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-hairline pt-3.5">
                <span className="text-base text-ink-2">Acesso de coach</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked
                  aria-label={`Remover acesso de ${coach.firstName}`}
                  disabled={busy}
                  onClick={() => void setCoachFlag(coach, false)}
                  className="flex h-7 w-12 shrink-0 items-center justify-end rounded-full bg-highlight px-1"
                >
                  <span className="size-5.5 rounded-full bg-surface" />
                </button>
              </div>
            </Panel>
          )
        })}

        <button
          type="button"
          disabled={busy}
          onClick={() => setPromoting(true)}
          className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-hairline p-5.5 transition-colors hover:border-hairline-strong"
        >
          <span className="grid size-11 place-items-center rounded-full bg-row-hover text-xl text-ink-2">
            +
          </span>
          <span className="text-md text-ink-2">Adicionar coach</span>
          <span className="text-center text-sm text-ink-3">
            Promova um aluno já cadastrado
          </span>
        </button>
      </div>

      <Panel className="min-h-0 flex-1 gap-3.5 p-5.5">
        <span className="section-label">O que o coach pode fazer</span>
        <div className="grid grid-cols-2 gap-x-10">
          {PERMISSIONS.map((permission) => (
            <div
              key={permission.label}
              className={cn(
                'flex items-center gap-3 border-t border-hairline py-3 text-md',
                !permission.allowed && 'text-ink-3'
              )}
            >
              {permission.allowed ? (
                <CheckIcon className="size-4.5" />
              ) : (
                <CloseIcon className="size-4.5" />
              )}
              {permission.label}
            </div>
          ))}
        </div>
      </Panel>

      <PickerDialog
        open={promoting}
        title="Promover aluno a coach"
        description="O coach passa a publicar WODs e ver a presença de todas as aulas."
        placeholder="Escolha o aluno"
        options={members.map((user) => ({
          value: user.id,
          label: fullName(user.firstName, user.lastName),
        }))}
        confirmLabel="Promover"
        onOpenChange={setPromoting}
        onConfirm={async (userId) => {
          const user = members.find((item) => item.id === userId)
          if (user) await setCoachFlag(user, true)
        }}
      />
    </Page>
  )
}
