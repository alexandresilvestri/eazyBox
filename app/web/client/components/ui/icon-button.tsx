import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

type IconButtonProps = ComponentProps<'button'> & { 'aria-label': string }

export function IconButton({ className, ...props }: IconButtonProps) {
  return (
    <button
      data-slot="icon-button"
      className={cn(
        'inline-flex size-9 shrink-0 items-center justify-center rounded-md border border-hairline bg-panel text-ink-1 transition-colors outline-none hover:border-hairline-strong hover:bg-row-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-solid disabled:pointer-events-none disabled:opacity-50',
        className
      )}
      {...props}
    />
  )
}
