import { useEffect, useRef, useState } from 'react'
import { fullName, initials } from '@eazybox/shared'
import type { User } from '@eazybox/shared'

export function UserMenu({
  user,
  onLogout,
}: {
  user: User
  onLogout: () => void
}) {
  const [open, setOpen] = useState(false)
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
            onClick={onLogout}
            className="w-full border-t border-hairline px-3.5 py-2.5 text-left text-base font-semibold text-ink-1 transition-colors hover:bg-row-hover"
          >
            Sair
          </button>
        </div>
      ) : null}
    </div>
  )
}
