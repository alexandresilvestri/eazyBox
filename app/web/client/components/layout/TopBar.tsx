import { NavLink } from 'react-router'
import type { User } from '@eazybox/shared'
import { navFor } from '@/components/layout/nav-items'
import { UserMenu } from '@/components/layout/UserMenu'
import { Mark } from '@/components/ui-x/Mark'
import { cn } from '@/lib/utils'

export function TopBar({
  user,
  onLogout,
}: {
  user: User
  onLogout: () => void
}) {
  return (
    <header className="flex h-[68px] shrink-0 items-stretch gap-7 border-b border-hairline px-6">
      <div className="flex shrink-0 items-center gap-3">
        <Mark className="size-[34px]" />
        <span className="font-display text-lg tracking-heading">EazyBox</span>
      </div>

      <nav className="flex min-w-0 flex-1 items-stretch gap-0.5">
        {navFor(user.isAdmin).map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center border-b-2 px-3.5 text-base font-semibold transition-colors',
                isActive
                  ? 'border-accent-solid text-ink-1'
                  : 'border-transparent text-ink-2 hover:text-ink-1'
              )
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <UserMenu user={user} onLogout={onLogout} />
    </header>
  )
}
