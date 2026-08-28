import { cn } from '@/lib/utils'

export function OccupancyBar({
  value,
  total,
  withLabel = false,
}: {
  value: number
  total: number
  withLabel?: boolean
}) {
  const ratio = total > 0 ? Math.min(1, Math.max(0, value / total)) : 0
  const full = ratio >= 1

  return (
    <span className="flex items-center gap-2">
      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink-ghost">
        <span
          className={cn('block h-full', full ? 'bg-highlight' : 'bg-ink-1')}
          style={{ width: `${ratio * 100}%` }}
        />
      </span>
      {withLabel ? (
        <span className={cn('text-sm', full ? 'text-highlight' : 'text-ink-2')}>
          {Math.round(ratio * 100)}%
        </span>
      ) : null}
    </span>
  )
}
