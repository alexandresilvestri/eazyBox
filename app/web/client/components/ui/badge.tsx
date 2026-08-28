import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex w-fit shrink-0 items-center gap-1.5 rounded-xs px-2 py-1 text-2xs font-bold tracking-bold uppercase',
  {
    variants: {
      tone: {
        plain: 'px-0 text-ink-3',
        outline: 'border border-hairline text-ink-2',
        highlight: 'bg-highlight text-highlight-ink',
        light: 'bg-ink-1 text-accent-ink',
      },
    },
    defaultVariants: { tone: 'plain' },
  }
)

export type Tone = NonNullable<VariantProps<typeof badgeVariants>['tone']>

type BadgeProps = ComponentProps<'span'> & { tone?: Tone }

export function Badge({ className, tone = 'plain', ...props }: BadgeProps) {
  return (
    <span
      data-slot="badge"
      data-tone={tone}
      className={cn(badgeVariants({ tone }), className)}
      {...props}
    />
  )
}
