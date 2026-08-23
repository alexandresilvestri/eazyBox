import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/lib/utils'

type BandProps = ComponentProps<'section'> & {
  title: ReactNode
  subtitle?: ReactNode
}

export function Band({
  className,
  title,
  subtitle,
  children,
  ...props
}: BandProps) {
  return (
    <section className={cn('px-8 pt-8', className)} {...props}>
      <div className="border-b border-hairline pb-3">
        <div>
          <h2 className="text-sm font-bold tracking-bold text-ink-1 uppercase">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1 max-w-[720px] text-xs text-ink-2">{subtitle}</p>
          )}
        </div>
      </div>
      <div className="pt-5">{children}</div>
    </section>
  )
}

export function StatCell({
  label,
  value,
}: {
  label: ReactNode
  value: ReactNode
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="eyebrow">{label}</span>
      <span className="display-numeral text-2xl leading-none text-ink-1">
        {value}
      </span>
    </div>
  )
}
