import { createContext, useContext, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

const ColumnsContext = createContext('1fr')

export function HairlineTable({
  columns,
  head,
  children,
  className,
}: {
  columns: string
  head: string[]
  children: ReactNode
  className?: string
}) {
  return (
    <ColumnsContext.Provider value={columns}>
      <div
        className={cn(
          'flex min-h-0 flex-col overflow-hidden rounded-lg bg-panel',
          className
        )}
      >
        <div className="flex min-h-0 flex-col overflow-y-auto px-5.5">
          <div
            className="sticky top-0 z-10 grid gap-3.5 border-b border-hairline bg-panel pt-3.5 pb-2.5 text-2xs font-semibold tracking-label text-ink-3 uppercase"
            style={{ gridTemplateColumns: columns }}
          >
            {head.map((label, index) => (
              <span key={`${label}-${index}`}>{label}</span>
            ))}
          </div>
          {children}
        </div>
      </div>
    </ColumnsContext.Provider>
  )
}

export function HairlineRow({
  children,
  selected = false,
  onClick,
}: {
  children: ReactNode
  selected?: boolean
  onClick?: () => void
}) {
  const columns = useContext(ColumnsContext)

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-pressed={onClick ? selected : undefined}
      onClick={onClick}
      onKeyDown={(event) => {
        if (onClick && (event.key === 'Enter' || event.key === ' ')) {
          event.preventDefault()
          onClick()
        }
      }}
      className={cn(
        'grid items-center gap-3.5 border-b border-hairline py-3.5 text-md',
        onClick && 'cursor-pointer',
        selected
          ? 'border-accent-border bg-accent-fill-weak'
          : onClick && 'hover:bg-row-hover'
      )}
      style={{ gridTemplateColumns: columns }}
    >
      {children}
    </div>
  )
}
