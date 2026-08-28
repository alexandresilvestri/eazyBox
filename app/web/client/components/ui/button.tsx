import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

const FOCUS =
  'outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-solid'

const buttonVariants = cva(
  `inline-flex shrink-0 items-center justify-center gap-2 rounded-md font-sans font-bold tracking-bold uppercase whitespace-nowrap transition-[filter,background-color,border-color] ${FOCUS} disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4`,
  {
    variants: {
      variant: {
        solid: 'bg-accent-solid text-accent-ink hover:brightness-110',
        light: 'bg-ink-1 text-accent-ink hover:brightness-95',
        outline:
          'border border-hairline text-ink-1 hover:border-hairline-strong hover:bg-row-hover',
      },
      size: {
        md: 'h-12 px-6 text-md',
        lg: 'h-14 px-7 text-md',
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
