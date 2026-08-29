import { useEffect, useRef, useState } from 'react'
import { changePasswordSchema, fullName, initials } from '@eazybox/shared'
import type { User } from '@eazybox/shared'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/auth-context'

const EMPTY_DRAFT = { currentPassword: '', password: '', confirmation: '' }

export function UserMenu({
  user,
  onLogout,
}: {
  user: User
  onLogout: () => void
}) {
  const { changePassword } = useAuth()
  const [open, setOpen] = useState(false)
  const [changing, setChanging] = useState(false)
  const [draft, setDraft] = useState(EMPTY_DRAFT)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const name = fullName(user.firstName, user.lastName)

  const valid =
    changePasswordSchema.safeParse(draft).success &&
    draft.password === draft.confirmation

  async function submit() {
    setBusy(true)
    setError(null)
    try {
      await changePassword(draft.currentPassword, draft.password)
      setChanging(false)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Não foi possível salvar a senha'
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <div ref={containerRef} className="relative flex shrink-0 items-center">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        title={name}
        className="grid size-9 place-items-center rounded-full border border-hairline bg-panel text-xs font-bold text-ink-1 transition-colors hover:border-hairline-strong"
      >
        {initials(user.firstName, user.lastName)}
      </button>

      {open ? (
        <div className="fade-pop absolute top-full right-0 z-50 mt-2 w-56 overflow-hidden rounded-lg border border-hairline bg-panel shadow-lg">
          <div className="flex flex-col gap-0.5 px-3.5 py-3">
            <span className="truncate text-base font-semibold text-ink-1">
              {name}
            </span>
            <span className="truncate text-2xs text-ink-3">{user.email}</span>
            <span className="text-2xs text-ink-3">
              {user.isAdmin ? 'Admin' : 'Coach'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              setOpen(false)
              setError(null)
              setDraft(EMPTY_DRAFT)
              setChanging(true)
            }}
            className="w-full border-t border-hairline px-3.5 py-2.5 text-left text-base font-semibold text-ink-1 transition-colors hover:bg-row-hover"
          >
            Alterar senha
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="w-full border-t border-hairline px-3.5 py-2.5 text-left text-base font-semibold text-ink-1 transition-colors hover:bg-row-hover"
          >
            Sair
          </button>
        </div>
      ) : null}

      <Dialog open={changing} onOpenChange={setChanging}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar senha</DialogTitle>
            <DialogDescription>
              Suas outras sessões param de renovar e expiram em até 15 minutos.
            </DialogDescription>
          </DialogHeader>

          <label className="flex flex-col gap-2">
            <span className="field-label">Senha atual</span>
            <Input
              type="password"
              autoComplete="current-password"
              value={draft.currentPassword}
              onChange={(event) =>
                setDraft({ ...draft, currentPassword: event.target.value })
              }
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-2">
              <span className="field-label">Nova senha</span>
              <Input
                type="password"
                autoComplete="new-password"
                value={draft.password}
                onChange={(event) =>
                  setDraft({ ...draft, password: event.target.value })
                }
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="field-label">Confirmar</span>
              <Input
                type="password"
                autoComplete="new-password"
                value={draft.confirmation}
                onChange={(event) =>
                  setDraft({ ...draft, confirmation: event.target.value })
                }
              />
            </label>
          </div>

          {draft.confirmation && draft.password !== draft.confirmation ? (
            <p className="text-base text-accent-text">As senhas não conferem</p>
          ) : null}
          {error ? <p className="text-base text-accent-text">{error}</p> : null}

          <Button disabled={busy || !valid} onClick={() => void submit()}>
            Salvar senha
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}
