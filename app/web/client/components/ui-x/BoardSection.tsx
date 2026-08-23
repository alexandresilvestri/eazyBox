import { cn } from '@/lib/utils'

type BoardSectionProps = {
  label: string
  children?: string | null
  emphasis?: boolean
  className?: string
}

export function BoardSection({
  label,
  children,
  emphasis = false,
  className,
}: BoardSectionProps) {
  if (!children) return null

  return (
    <section
      className={cn(
        'border-l-2 pl-4',
        emphasis ? 'border-l-accent-solid' : 'border-l-hairline',
        className
      )}
    >
      <h3 className="eyebrow">{label}</h3>
      <p className="board-body mt-2">{children}</p>
    </section>
  )
}
