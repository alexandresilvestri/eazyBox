import type { ReactNode } from 'react'

export function Page({
  eyebrow,
  title,
  actions,
  children,
}: {
  eyebrow: string
  title: string
  actions?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5.5">
      <div className="flex items-end justify-between gap-6">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="mt-2 font-display text-heading tracking-heading">
            {title}
          </h1>
        </div>
        {actions ? (
          <div className="flex shrink-0 items-center gap-2.5">{actions}</div>
        ) : null}
      </div>
      {children}
    </div>
  )
}
