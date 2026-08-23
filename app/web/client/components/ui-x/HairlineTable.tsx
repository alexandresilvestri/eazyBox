import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

type TableProps = ComponentProps<'table'> & { columns?: string[] }

export function HairlineTable({
  className,
  columns,
  children,
  ...props
}: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table
        className={cn('w-full border-collapse text-sm', className)}
        {...props}
      >
        {columns && (
          <colgroup>
            {columns.map((width, index) => (
              <col
                key={index}
                style={width === 'auto' ? undefined : { width }}
              />
            ))}
          </colgroup>
        )}
        {children}
      </table>
    </div>
  )
}

export function HairlineTr({
  className,
  onClick,
  ...props
}: ComponentProps<'tr'>) {
  return (
    <tr
      onClick={onClick}
      className={cn(
        'border-b border-hairline transition-colors last:border-b-0',
        onClick && 'hover-row cursor-pointer',
        className
      )}
      {...props}
    />
  )
}

export function HairlineTh({ className, ...props }: ComponentProps<'th'>) {
  return (
    <th className={cn('eyebrow py-2 pr-4 text-left', className)} {...props} />
  )
}

export function HairlineTd({ className, ...props }: ComponentProps<'td'>) {
  return (
    <td
      className={cn('py-3 pr-4 align-middle text-ink-1', className)}
      {...props}
    />
  )
}
