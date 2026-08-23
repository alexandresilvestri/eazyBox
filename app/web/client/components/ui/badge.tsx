import { cva } from 'class-variance-authority'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export const badgeVariants = cva(
  'inline-flex w-fit shrink-0 items-center gap-1.5 rounded-md px-2 py-0.5 text-2xs font-bold tracking-label uppercase',
  {
    variants: {
      tone: {
        neutral: 'bg-row-hover text-ink-2',
        accent: 'bg-accent-fill text-accent-text',
        ok: 'bg-ok-fill text-ok-ink',
      },
    },
    defaultVariants: { tone: 'neutral' },
  }
)

const DOT_TONE = {
  neutral: 'bg-ink-3',
  accent: 'bg-accent-solid',
  ok: 'bg-ok',
} as const

export type Tone = keyof typeof DOT_TONE

type BadgeProps = ComponentProps<'span'> & { tone?: Tone; dot?: boolean }

export function Badge({
  className,
  tone = 'neutral',
  dot,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      data-slot="badge"
      data-tone={tone}
      className={cn(badgeVariants({ tone }), className)}
      {...props}
    >
      {dot && (
        <span
          className={cn('size-1.5 shrink-0 rounded-full', DOT_TONE[tone])}
        />
      )}
      {children}
    </span>
  )
}
