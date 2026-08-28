import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export function Panel({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('flex flex-col rounded-lg bg-panel p-5', className)}
      {...props}
    />
  )
}
