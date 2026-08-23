import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/lib/utils'

type SectionCardProps = ComponentProps<'section'> & {
  title?: ReactNode
  description?: ReactNode
  action?: ReactNode
}

export function SectionCard({
  className,
  title,
  description,
  action,
  children,
  ...props
}: SectionCardProps) {
  return (
    <section
      data-slot="section-card"
      className={cn(
        'flex flex-col gap-4 rounded-lg border border-hairline bg-surface p-5',
        className
      )}
      {...props}
    >
      {(title || description || action) && (
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            {title && (
              <h3 className="text-sm font-bold tracking-bold text-ink-1 uppercase">
                {title}
              </h3>
            )}
            {description && (
              <p className="mt-1 max-w-[560px] text-xs text-ink-2">
                {description}
              </p>
            )}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  )
}
