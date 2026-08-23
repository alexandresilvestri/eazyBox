import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

const FOCUS =
  'outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-solid'

export const buttonVariants = cva(
  `inline-flex shrink-0 items-center justify-center gap-2 rounded-md font-sans text-sm font-bold tracking-bold whitespace-nowrap transition-colors ${FOCUS} disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4`,
  {
    variants: {
      variant: {
        solid: 'bg-accent-solid text-accent-ink hover:bg-accent-text',
        outline:
          'border border-hairline text-ink-1 hover:border-accent-border hover:bg-accent-fill-weak',
        ghost: 'text-ink-2 hover:bg-row-hover hover:text-ink-1',
        danger:
          'bg-error-fill text-error-ink hover:bg-error hover:text-accent-ink',
      },
      size: {
        sm: 'h-8 px-3',
        md: 'h-9 px-4',
        lg: 'h-11 px-6',
      },
    },
    defaultVariants: { variant: 'solid', size: 'md' },
  }
)

type ButtonProps = ComponentProps<'button'> &
  VariantProps<typeof buttonVariants>

export function Button({
  className,
  variant = 'solid',
  size = 'md',
  ...props
}: ButtonProps) {
  return (
    <button
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
}
