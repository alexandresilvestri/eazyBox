import { Dialog as DialogPrimitive } from 'radix-ui'
import { IconX } from '@tabler/icons-react'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export const Dialog = DialogPrimitive.Root

export function DialogContent({
  className,
  children,
  ...props
}: ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="scrim-fade fixed inset-0 z-50 bg-scrim" />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          'radix-pop fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-5 rounded-lg border border-hairline bg-surface p-6 shadow-lg outline-none sm:max-w-lg [&>*]:min-w-0',
          className
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          aria-label="Fechar"
          className="absolute top-4 right-4 rounded-md p-1 text-ink-3 transition-colors outline-none hover:bg-row-hover hover:text-ink-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-solid"
        >
          <IconX className="size-4" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

export function DialogHeader({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div className={cn('flex flex-col gap-1.5 pr-8', className)} {...props} />
  )
}

export function DialogTitle({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn(
        'text-sm font-bold tracking-bold text-ink-1 uppercase',
        className
      )}
      {...props}
    />
  )
}

export function DialogDescription({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={cn('text-xs text-ink-2', className)}
      {...props}
    />
  )
}
