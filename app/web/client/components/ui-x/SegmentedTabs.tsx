import { cn } from '@/lib/utils'

export function SegmentedTabs<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (next: T) => void
}) {
  return (
    <div className="flex h-12 items-center rounded-md border border-hairline bg-panel p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            'grid h-full place-items-center rounded-sm px-3.5 text-sm font-semibold transition-colors',
            option.value === value
              ? 'bg-ink-1 text-accent-ink'
              : 'text-ink-2 hover:text-ink-1'
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
