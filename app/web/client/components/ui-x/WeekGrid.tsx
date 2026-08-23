import { WEEK_DAYS, WEEK_DAY_LABEL, isoDate } from '@eazybox/shared'
import type { WeekDay } from '@eazybox/shared'
import {
  HairlineTable,
  HairlineTd,
  HairlineTh,
  HairlineTr,
} from '@/components/ui-x/HairlineTable'
import { TallyMeter } from '@/components/ui-x/TallyMeter'

export type WeekGridCell = { sessionId: string; count: number } | null

type WeekGridProps = {
  times: string[]
  dates: Date[]
  cellFor: (weekDay: WeekDay, time: string) => WeekGridCell
  onSelect?: (sessionId: string) => void
}

const today = () => isoDate(new Date())

export function WeekGrid({ times, dates, cellFor, onSelect }: WeekGridProps) {
  const todayIso = today()

  if (times.length === 0) {
    return (
      <p className="text-xs text-ink-2">
        Nenhum horário na grade. Cadastre a grade semanal para ver a semana
        aqui.
      </p>
    )
  }

  return (
    <HairlineTable columns={['72px', ...WEEK_DAYS.map(() => 'auto')]}>
      <thead>
        <HairlineTr>
          <HairlineTh>Hora</HairlineTh>
          {dates.map((date, index) => (
            <HairlineTh key={index}>
              <span className="flex items-baseline gap-1.5">
                {WEEK_DAY_LABEL[WEEK_DAYS[index] as WeekDay]}
                <span
                  className={
                    isoDate(date) === todayIso
                      ? 'display-numeral text-sm text-accent-text'
                      : 'display-numeral text-sm text-ink-2'
                  }
                >
                  {date.getDate()}
                </span>
              </span>
            </HairlineTh>
          ))}
        </HairlineTr>
      </thead>
      <tbody>
        {times.map((time) => (
          <HairlineTr key={time}>
            <HairlineTd className="display-numeral text-lg text-ink-1">
              {time.slice(0, 5)}
            </HairlineTd>
            {WEEK_DAYS.map((weekDay) => {
              const cell = cellFor(weekDay, time)
              return (
                <HairlineTd key={weekDay}>
                  {cell ? (
                    <button
                      type="button"
                      onClick={() => onSelect?.(cell.sessionId)}
                      className="rounded-md px-1 py-0.5 outline-none hover:bg-row-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-solid"
                    >
                      <TallyMeter count={cell.count} />
                    </button>
                  ) : (
                    <span className="text-ink-3" aria-label="sem sessão">
                      ·
                    </span>
                  )}
                </HairlineTd>
              )
            })}
          </HairlineTr>
        ))}
      </tbody>
    </HairlineTable>
  )
}
