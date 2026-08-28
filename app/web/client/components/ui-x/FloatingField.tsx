import type { ComponentProps } from 'react'

type Props = Omit<ComponentProps<'input'>, 'className'> & {
  label: string
  reveal?: boolean
  onToggleReveal?: () => void
}

export function FloatingField({
  label,
  reveal,
  onToggleReveal,
  ...input
}: Props) {
  return (
    <label className="field-fill relative flex h-16 items-center pr-2 pl-4">
      <span className="field-label absolute top-3 left-4">{label}</span>
      <input
        {...input}
        className="min-w-0 flex-1 bg-transparent pt-4 text-lg text-ink-1 outline-none"
      />
      {onToggleReveal ? (
        <button
          type="button"
          onClick={onToggleReveal}
          className="h-11 self-center rounded-sm px-3 text-xs font-semibold tracking-bold text-ink-2 uppercase transition-colors hover:bg-row-hover hover:text-ink-1"
        >
          {reveal ? 'Ocultar' : 'Mostrar'}
        </button>
      ) : null}
    </label>
  )
}
