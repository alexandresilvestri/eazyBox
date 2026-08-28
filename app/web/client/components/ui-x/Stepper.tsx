export function Stepper({
  value,
  suffix,
  min = 1,
  max = 99,
  onChange,
}: {
  value: number
  suffix?: string
  min?: number
  max?: number
  onChange: (next: number) => void
}) {
  return (
    <div className="flex items-center gap-0.5 rounded-sm border border-hairline bg-surface p-1">
      <button
        type="button"
        aria-label="Diminuir"
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
        className="grid size-9 place-items-center rounded-sm bg-row-hover text-lg select-none disabled:opacity-40"
      >
        −
      </button>
      <span className="min-w-10 text-center text-lg font-bold">
        {value}
        {suffix}
      </span>
      <button
        type="button"
        aria-label="Aumentar"
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
        className="grid size-9 place-items-center rounded-sm bg-row-hover text-lg select-none disabled:opacity-40"
      >
        +
      </button>
    </div>
  )
}
