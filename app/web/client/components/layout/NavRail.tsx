import { NavLink } from 'react-router'
import { NAV_ITEMS } from './nav-items'
import { cn } from '@/lib/utils'

const ACTIVE = 'bg-accent-fill text-accent-text'
const INACTIVE = 'text-ink-2 hover:bg-row-hover hover:text-ink-1'

export function NavRail() {
  return (
    <nav
      aria-label="Navegação principal"
      className="group fixed top-1/2 left-0 z-40 hidden max-h-[80dvh] w-(--rail-width) -translate-y-1/2 flex-col gap-1 rounded-r-rail border border-l-0 border-hairline bg-surface p-2 transition-[width] duration-300 ease-swift hover:w-(--rail-width-expanded) has-[:focus-visible]:w-(--rail-width-expanded) motion-reduce:transition-none md:flex"
    >
      {NAV_ITEMS.map(({ to, label, icon: Icon }, index) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          style={
            { '--reveal-delay': `${30 + index * 22}ms` } as React.CSSProperties
          }
          className={({ isActive }) =>
            cn(
              'group/row flex h-10 w-full items-center gap-4 rounded-md pl-2.5 whitespace-nowrap outline-none transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent-solid',
              isActive ? ACTIVE : INACTIVE
            )
          }
        >
          <Icon className="size-5 shrink-0" />
          <span className="-translate-x-1.5 pr-4 text-xs font-bold tracking-bold opacity-0 transition-[opacity,translate] duration-200 ease-swift group-hover:translate-x-0 group-hover:opacity-100 group-hover:[transition-delay:var(--reveal-delay)] group-has-[:focus-visible]:translate-x-0 group-has-[:focus-visible]:opacity-100 motion-reduce:transition-none">
            {label}
          </span>
        </NavLink>
      ))}
    </nav>
  )
}

export function NavStrip() {
  return (
    <nav
      aria-label="Navegação principal"
      className="flex gap-1 overflow-x-auto border-b border-hairline px-4 py-2 md:hidden"
    >
      {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            cn(
              'inline-flex shrink-0 items-center gap-2 rounded-md px-3 py-1.5 text-xs font-bold tracking-bold whitespace-nowrap outline-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-solid',
              isActive ? ACTIVE : INACTIVE
            )
          }
        >
          <Icon className="size-4" />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
