import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

type IconButtonProps = ComponentProps<'button'> & {
  'aria-label': string
  size?: 28 | 34
}

const SIZES = {
  28: 'size-7',
  34: 'size-[34px]',
} as const

export function IconButton({
  className,
  size = 34,
  ...props
}: IconButtonProps) {
  return (
    <button
      data-slot="icon-button"
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-md border border-hairline text-ink-2 transition-colors outline-none hover:border-accent-border hover:bg-accent-fill-weak hover:text-ink-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-solid disabled:pointer-events-none disabled:opacity-50',
        SIZES[size],
        className
      )}
      {...props}
    />
  )
}
