import { useMemo, useState } from 'react'
import {
  dayAndMonth,
  dayBySession,
  dayDate,
  fullName,
  isoDate,
  startOfWeek,
} from '@eazybox/shared'
import { useBox } from '@/box-context'
import { Button } from '@/components/ui/button'
import { BarChart } from '@/components/ui-x/BarChart'
import { HairlineRow, HairlineTable } from '@/components/ui-x/HairlineTable'
import { Page } from '@/components/ui-x/Page'
import { Panel } from '@/components/ui-x/Panel'
import { SegmentedTabs } from '@/components/ui-x/SegmentedTabs'
import { StatCard } from '@/components/ui-x/StatCard'
import {
  byWeekday,
  checkinsInDays,
  dayRange,
  perMember,
  toCsv,
  trainingDays,
  undoneInDays,
} from '@/lib/reports'

type Period = 'day' | 'week' | 'month'

const BOM = '\uFEFF'

const PERIODS: { value: Period; label: string; title: string }[] = [
  { value: 'day', label: 'Dia', title: 'Check-ins do dia' },
  { value: 'week', label: 'Semana', title: 'Check-ins da semana' },
  { value: 'month', label: 'Mês', title: 'Check-ins do mês' },
]

const rangeFor = (period: Period, today: Date) => {
  if (period === 'day') return { start: today, length: 1 }
  if (period === 'week') return { start: startOfWeek(today), length: 7 }
  const start = new Date(today.getFullYear(), today.getMonth(), 1)
  const end = new Date(today.getFullYear(), today.getMonth() + 1, 0)
  return { start, length: end.getDate() }
}

export default function Checkins() {
  const { sessions, checkins, users } = useBox()
  const [period, setPeriod] = useState<Period>('week')

  const today = useMemo(() => new Date(), [])
  const { start, length } = rangeFor(period, today)

  const report = useMemo(() => {
    const window = dayRange(start, length)
    const days = dayBySession(sessions)
    const inWindow = checkinsInDays(checkins, days, window)
    const available = trainingDays(sessions, window)

    return {
      window,
      total: inWindow.length,
      available,
      unique: new Set(inWindow.map((checkin) => checkin.userId)).size,
      undone: undoneInDays(checkins, days, window),
      bars: byWeekday(inWindow, days),
      rows: perMember(inWindow, users, days, available),
    }
  }, [checkins, sessions, users, start, length])

  const activeMembers = users.filter((user) => user.isActive).length
  const lastDay = report.window[report.window.length - 1]
  const rangeLabel =
    period === 'day'
      ? dayAndMonth(start)
      : `${dayAndMonth(start)} a ${dayAndMonth(dayDate(lastDay ?? isoDate(start)))}`

  function exportCsv() {
    const csv = toCsv(
      ['Aluno', 'E-mail', 'Check-ins', 'Faltas', 'Frequência'],
      report.rows.map((row) => [
        fullName(row.user.firstName, row.user.lastName),
        row.user.email,
        row.attended,
        row.missed,
        `${Math.round(row.rate * 100)}%`,
      ])
    )
    const url = URL.createObjectURL(
      new Blob([BOM, csv], { type: 'text/csv;charset=utf-8' })
    )
    const link = document.createElement('a')
    link.href = url
    link.download = `check-ins-${isoDate(start)}.csv`
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 0)
  }

  return (
    <Page
      eyebrow={rangeLabel}
      title={PERIODS.find((item) => item.value === period)?.title ?? ''}
      actions={
        <>
          <SegmentedTabs
            options={PERIODS}
            value={period}
            onChange={setPeriod}
          />
          <Button onClick={exportCsv}>Exportar CSV</Button>
        </>
      }
    >
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          label="Total de check-ins"
          value={report.total}
          detail={
            report.available.length > 0
              ? `média de ${Math.round(report.total / report.available.length)} por dia com aula`
              : 'nenhum dia com aula no período'
          }
          big
        />
        <StatCard
          label="Alunos únicos"
          value={report.unique}
          detail={`de ${activeMembers} ativos${
            activeMembers > 0
              ? ` · ${Math.round((report.unique / activeMembers) * 100)}%`
              : ''
          }`}
        />
        <StatCard
          label="Check-ins desfeitos"
          value={report.undone}
          detail={
            report.total + report.undone > 0
              ? `${Math.round((report.undone / (report.total + report.undone)) * 100)}% do total`
              : 'nenhum desfeito'
          }
        />
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-2 gap-4">
        <Panel className="min-h-0 gap-4 p-5.5">
          <span className="section-label">Por dia da semana</span>
          <BarChart bars={report.bars} withValues />
        </Panel>

        <HairlineTable
          columns="1fr 90px 80px 100px"
          head={['Aluno', 'Check-ins', 'Faltas', 'Frequência']}
          className="min-h-0"
        >
          {report.rows.map((row) => (
            <HairlineRow key={row.user.id}>
              <span className="truncate">
                {fullName(row.user.firstName, row.user.lastName)}
              </span>
              <span className="text-base text-ink-2">{row.attended}</span>
              <span className="text-base text-ink-2">{row.missed}</span>
              <span
                className={
                  row.rate < 0.5
                    ? 'text-base font-semibold text-highlight'
                    : 'text-base font-semibold'
                }
              >
                {Math.round(row.rate * 100)}%
              </span>
            </HairlineRow>
          ))}
        </HairlineTable>
      </div>
    </Page>
  )
}
