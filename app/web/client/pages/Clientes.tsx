import { useMemo, useState } from 'react'
import {
  createUserSchema,
  dayBySession,
  fullName,
  initials,
  isoDate,
} from '@eazybox/shared'
import type { User } from '@eazybox/shared'
import { useBox } from '@/box-context'
import { Badge, type Tone } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Avatar } from '@/components/ui-x/Avatar'
import { HairlineRow, HairlineTable } from '@/components/ui-x/HairlineTable'
import { Page } from '@/components/ui-x/Page'
import { SearchInput } from '@/components/ui-x/SearchInput'
import { SegmentedTabs } from '@/components/ui-x/SegmentedTabs'
import { apiFetch } from '@/lib/api'
import { dayLabel, liveCheckins } from '@/lib/reports'

type Filter = 'all' | 'active' | 'inactive'

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'active', label: 'Ativos' },
  { value: 'inactive', label: 'Inativos' },
]

const EMPTY_DRAFT = { email: '', firstName: '', lastName: '', password: '' }

const roleOf = (user: User): { label: string; tone: Tone } => {
  if (user.isAdmin) return { label: 'Admin', tone: 'light' }
  if (user.isCoach) return { label: 'Coach', tone: 'outline' }
  return { label: 'Aluno', tone: 'plain' }
}

export default function Clientes() {
  const { users, checkins, sessions, reload } = useBox()
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')
  const [creating, setCreating] = useState(false)
  const [draft, setDraft] = useState(EMPTY_DRAFT)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const today = useMemo(() => isoDate(new Date()), [])

  const stats = useMemo(() => {
    const days = dayBySession(sessions)
    const totals = new Map<string, { count: number; last: string }>()
    for (const checkin of liveCheckins(checkins)) {
      const day = days.get(checkin.workoutSessionId)
      const current = totals.get(checkin.userId) ?? { count: 0, last: '' }
      totals.set(checkin.userId, {
        count: current.count + 1,
        last: day && day > current.last ? day : current.last,
      })
    }
    return totals
  }, [checkins, sessions])

  const term = query.trim().toLowerCase()
  const visible = users.filter((user) => {
    if (filter === 'active' && !user.isActive) return false
    if (filter === 'inactive' && user.isActive) return false
    if (!term) return true
    return `${user.firstName} ${user.lastName} ${user.email}`
      .toLowerCase()
      .includes(term)
  })

  async function create() {
    setBusy(true)
    setError(null)
    try {
      await apiFetch('/users', { method: 'POST', body: JSON.stringify(draft) })
      await reload.users()
      setCreating(false)
      setDraft(EMPTY_DRAFT)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível salvar')
    } finally {
      setBusy(false)
    }
  }

  async function toggleActive(user: User) {
    setBusy(true)
    try {
      await apiFetch(`/users/${user.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: !user.isActive }),
      })
      await reload.users()
    } finally {
      setBusy(false)
    }
  }

  return (
    <Page
      eyebrow={`${users.length} cadastrados · ${users.filter((user) => user.isActive).length} ativos`}
      title="Clientes"
      actions={
        <>
          <SegmentedTabs
            options={FILTERS}
            value={filter}
            onChange={setFilter}
          />
          <SearchInput
            value={query}
            placeholder="Nome ou e-mail…"
            onChange={setQuery}
            className="w-60"
          />
          <Button onClick={() => setCreating(true)}>Novo cliente</Button>
        </>
      }
    >
      <HairlineTable
        columns="1.2fr 1.4fr 110px 110px 130px 90px"
        head={[
          'Nome',
          'E-mail',
          'Papel',
          'Check-ins',
          'Último treino',
          'Status',
        ]}
        className="min-h-0 flex-1"
      >
        {visible.map((user) => {
          const role = roleOf(user)
          return (
            <HairlineRow key={user.id}>
              <span className="flex items-center gap-2.5">
                <Avatar
                  label={initials(user.firstName, user.lastName)}
                  size={30}
                />
                {fullName(user.firstName, user.lastName)}
              </span>
              <span className="truncate text-base text-ink-2">
                {user.email}
              </span>
              <Badge tone={role.tone}>{role.label}</Badge>
              <span className="text-base text-ink-2">
                {stats.get(user.id)?.count ?? 0}
              </span>
              <span className="text-base text-ink-2">
                {dayLabel(stats.get(user.id)?.last, today, '—')}
              </span>
              <button
                type="button"
                disabled={busy || user.isAdmin}
                onClick={() => void toggleActive(user)}
                title={user.isActive ? 'Desativar' : 'Ativar'}
                className="justify-self-start text-2xs font-bold tracking-bold uppercase disabled:opacity-60"
              >
                <span className={user.isActive ? 'text-ink-2' : 'text-ink-3'}>
                  {user.isActive ? 'Ativo' : 'Inativo'}
                </span>
              </button>
            </HairlineRow>
          )
        })}
      </HairlineTable>

      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo cliente</DialogTitle>
            <DialogDescription>
              A conta é criada pela box. O aluno entra no app com esse e-mail.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-2">
              <span className="field-label">Nome</span>
              <Input
                value={draft.firstName}
                onChange={(event) =>
                  setDraft({ ...draft, firstName: event.target.value })
                }
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="field-label">Sobrenome</span>
              <Input
                value={draft.lastName}
                onChange={(event) =>
                  setDraft({ ...draft, lastName: event.target.value })
                }
              />
            </label>
          </div>

          <label className="flex flex-col gap-2">
            <span className="field-label">E-mail</span>
            <Input
              type="email"
              value={draft.email}
              onChange={(event) =>
                setDraft({ ...draft, email: event.target.value })
              }
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="field-label">Senha inicial</span>
            <Input
              type="password"
              value={draft.password}
              onChange={(event) =>
                setDraft({ ...draft, password: event.target.value })
              }
            />
          </label>

          {error ? <p className="text-base text-accent-text">{error}</p> : null}

          <Button
            disabled={busy || !createUserSchema.safeParse(draft).success}
            onClick={() => void create()}
          >
            Criar cliente
          </Button>
        </DialogContent>
      </Dialog>
    </Page>
  )
}
