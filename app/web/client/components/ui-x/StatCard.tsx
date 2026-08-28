import { cn } from '@/lib/utils'
import { Panel } from '@/components/ui-x/Panel'

export function StatCard({
  label,
  value,
  detail,
  big = false,
  highlight = false,
}: {
  label: string
  value: string | number
  detail: string
  big?: boolean
  highlight?: boolean
}) {
  return (
    <Panel className="gap-1.5">
      <span className="section-label">{label}</span>
      <span
        className={cn(
          big
            ? 'font-display text-display tracking-display'
            : 'mt-2 text-heading font-bold tracking-heading',
          highlight && 'text-highlight'
        )}
      >
        {value}
      </span>
      <span className="text-sm text-ink-3">{detail}</span>
    </Panel>
  )
}
