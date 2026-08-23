import { cn } from '@/lib/utils'

const MAX_TICKS = 12

const SIZE = {
  row: { tick: 'h-3 w-[3px]', gap: 'gap-[3px]', numeral: 'text-sm' },
  detail: { tick: 'h-5 w-1', gap: 'gap-1', numeral: 'text-xl' },
} as const

type TallyMeterProps = {
  count: number
  size?: keyof typeof SIZE
  className?: string
}

export function TallyMeter({
  count,
  size = 'row',
  className,
}: TallyMeterProps) {
  const { tick, gap, numeral } = SIZE[size]

  return (
    <span
      className={cn('inline-flex items-center gap-2', className)}
      aria-label={`${count} check-ins`}
    >
      <span className={cn('inline-flex items-end', gap)} aria-hidden>
        {Array.from({ length: Math.min(count, MAX_TICKS) }, (_, index) => (
          <span
            key={index}
            className={cn('inline-block rounded-[1px] bg-ink-1', tick)}
          />
        ))}
      </span>
      <span className={cn('display-numeral text-ink-2', numeral)}>{count}</span>
    </span>
  )
}
