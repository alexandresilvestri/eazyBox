import mark from '@/assets/eazybox-mark.png'
import { cn } from '@/lib/utils'

export function Mark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'grid shrink-0 place-items-center rounded-sm bg-ink-1 p-1',
        className
      )}
    >
      <img src={mark} alt="EazyBox" className="size-full object-contain" />
    </span>
  )
}
