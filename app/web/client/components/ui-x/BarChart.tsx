import { cn } from '@/lib/utils'

type Bar = { label: string; value: number }

export function BarChart({
  bars,
  withValues = false,
}: {
  bars: Bar[]
  withValues?: boolean
}) {
  const peak = Math.max(1, ...bars.map((bar) => bar.value))
  const single = bars.filter((bar) => bar.value === peak).length === 1

  return (
    <div className="flex min-h-0 flex-1 items-end gap-3">
      {bars.map((bar) => {
        const highlighted = single && bar.value === peak
        return (
          <div
            key={bar.label}
            className="flex h-full flex-1 flex-col items-center justify-end gap-2"
          >
            {withValues ? (
              <span
                className={cn(
                  'text-sm',
                  highlighted ? 'text-highlight' : 'text-ink-2'
                )}
              >
                {bar.value}
              </span>
            ) : null}
            <span
              className={cn(
                'w-full rounded-t-xs',
                highlighted ? 'bg-highlight' : 'bg-hairline-strong'
              )}
              style={{ height: `${Math.max(2, (bar.value / peak) * 100)}%` }}
            />
            <span
              className={cn(
                'text-xs',
                highlighted ? 'text-highlight' : 'text-ink-3'
              )}
            >
              {bar.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
