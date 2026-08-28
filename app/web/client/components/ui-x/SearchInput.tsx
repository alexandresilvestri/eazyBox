import { SearchIcon } from '@/components/ui/icons'
import { cn } from '@/lib/utils'

export function SearchInput({
  value,
  placeholder,
  onChange,
  className,
}: {
  value: string
  placeholder: string
  onChange: (next: string) => void
  className?: string
}) {
  return (
    <label
      className={cn(
        'field-fill flex h-12 items-center gap-2.5 px-4',
        className
      )}
    >
      <SearchIcon className="text-ink-3" />
      <input
        type="search"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="min-w-0 flex-1 bg-transparent text-md text-ink-1 outline-none placeholder:text-ink-3"
      />
    </label>
  )
}
