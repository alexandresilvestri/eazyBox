import { IconAlertCircle } from '@tabler/icons-react'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export function InlineAlert({
  className,
  children,
  ...props
}: ComponentProps<'div'>) {
  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-2.5 border-l-2 border-l-error bg-error-fill px-3.5 py-2.5 text-xs text-error-ink',
        className
      )}
      {...props}
    >
      <IconAlertCircle className="mt-px size-4 shrink-0" />
      <div className="min-w-0 wrap-anywhere">{children}</div>
    </div>
  )
}
