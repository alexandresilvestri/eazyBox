import { cn } from '@/lib/utils'

const SIZES = {
  30: 'size-[30px] text-2xs',
  32: 'size-8 text-2xs',
  52: 'size-13 text-lg',
} as const

export function Avatar({
  label,
  size = 32,
}: {
  label: string
  size?: keyof typeof SIZES
}) {
  return (
    <span
      className={cn(
        'grid shrink-0 place-items-center rounded-full bg-surface font-bold',
        SIZES[size]
      )}
    >
      {label}
    </span>
  )
}
