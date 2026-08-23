import { IconLogout, IconMoon, IconSun } from '@tabler/icons-react'
import { useState } from 'react'
import { useAuth } from '@/auth-context'
import { IconButton } from '@/components/ui/icon-button'
import {
  applyColorScheme,
  readColorScheme,
  type ColorScheme,
} from '@/lib/color-scheme'

export function TopBar() {
  const { user, logout } = useAuth()
  const [scheme, setScheme] = useState<ColorScheme>(readColorScheme)

  const toggleScheme = () => {
    const next = scheme === 'dark' ? 'light' : 'dark'
    applyColorScheme(next)
    setScheme(next)
  }

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-hairline bg-paper px-4 py-3 md:px-8">
      <div className="flex items-baseline gap-2">
        <span className="display-numeral text-xl text-ink-1">EAZYBOX</span>
        <span className="eyebrow">Console</span>
      </div>

      <div className="flex items-center gap-3">
        <span
          className="hidden text-xs text-ink-2 sm:inline"
          data-testid="current-user"
        >
          {user?.firstName} {user?.lastName} — {user?.email}
        </span>
        <IconButton
          aria-label={
            scheme === 'dark' ? 'Usar tema claro' : 'Usar tema escuro'
          }
          onClick={toggleScheme}
        >
          {scheme === 'dark' ? (
            <IconSun className="size-4" />
          ) : (
            <IconMoon className="size-4" />
          )}
        </IconButton>
        <IconButton
          aria-label="Sair"
          data-testid="logout"
          onClick={() => void logout()}
        >
          <IconLogout className="size-4" />
        </IconButton>
      </div>
    </header>
  )
}
