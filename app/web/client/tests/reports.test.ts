import { describe, expect, test } from 'bun:test'
import {
  byId,
  byTimeSlot,
  byWeekday,
  capacityOf,
  checkinsInDays,
  dayLabel,
  dayRange,
  lastUsedByWorkout,
  liveCheckins,
  occupancyRate,
  occupiedOf,
  perMember,
  toCsv,
  trainingDays,
  undoneInDays,
} from '../lib/reports'
import { aCheckin, aSession, aUser } from './fixtures'

const daysOf = (...sessions: ReturnType<typeof aSession>[]) =>
  new Map(sessions.map((session) => [session.id, session.sessionDate]))

describe('liveCheckins', () => {
  test('keeps only the check-ins that were not undone', () => {
    const live = aCheckin()
    expect(liveCheckins([live, aCheckin({ undone: true })])).toEqual([live])
  })
})

describe('capacityOf and occupiedOf', () => {
  test('sum across sessions', () => {
    const sessions = [
      aSession({ capacity: 20, occupied: 5 }),
      aSession({ capacity: 10, occupied: 3 }),
    ]
    expect(capacityOf(sessions)).toBe(30)
    expect(occupiedOf(sessions)).toBe(8)
  })

  test('are zero for an empty list', () => {
    expect(capacityOf([])).toBe(0)
    expect(occupiedOf([])).toBe(0)
  })
})

describe('occupancyRate', () => {
  test('is occupied over capacity', () => {
    expect(
      occupancyRate([
        aSession({ capacity: 20, occupied: 5 }),
        aSession({ capacity: 20, occupied: 15 }),
      ])
    ).toBe(0.5)
  })

  test('does not divide by zero when there is no capacity', () => {
    expect(occupancyRate([])).toBe(0)
    expect(occupancyRate([aSession({ capacity: 0, occupied: 0 })])).toBe(0)
  })

  test('can exceed one, which is how an over-booked day shows up', () => {
    expect(
      occupancyRate([aSession({ capacity: 1, occupied: 2 })])
    ).toBeGreaterThan(1)
  })
})

describe('dayRange', () => {
  test('returns consecutive iso days starting at from', () => {
    expect(dayRange(new Date(2026, 7, 24), 3)).toEqual([
      '2026-08-24',
      '2026-08-25',
      '2026-08-26',
    ])
  })

  test('is empty for a zero length window', () => {
    expect(dayRange(new Date(2026, 7, 24), 0)).toEqual([])
  })

  test('crosses a month boundary', () => {
    expect(dayRange(new Date(2026, 7, 31), 2)).toEqual([
      '2026-08-31',
      '2026-09-01',
    ])
  })
})

describe('byId', () => {
  test('indexes rows by their id', () => {
    const user = aUser()
    expect(byId([user]).get(user.id)).toBe(user)
  })

  test('is empty for no rows', () => {
    expect(byId([]).size).toBe(0)
  })
})

describe('checkinsInDays', () => {
  test('keeps live check-ins whose session falls inside the window', () => {
    const session = aSession({ sessionDate: '2026-08-24' })
    const inside = aCheckin({ workoutSessionId: session.id })
    const undone = aCheckin({ workoutSessionId: session.id, undone: true })
    expect(
      checkinsInDays([inside, undone], daysOf(session), ['2026-08-24'])
    ).toEqual([inside])
  })

  test('drops check-ins whose session falls outside the window', () => {
    const session = aSession({ sessionDate: '2026-08-24' })
    expect(
      checkinsInDays(
        [aCheckin({ workoutSessionId: session.id })],
        daysOf(session),
        ['2026-08-25']
      )
    ).toEqual([])
  })

  test('drops a check-in whose session is unknown', () => {
    expect(
      checkinsInDays([aCheckin({ workoutSessionId: 'gone' })], new Map(), [
        '2026-08-24',
      ])
    ).toEqual([])
  })
})

describe('byTimeSlot', () => {
  test('totals occupancy per hour, sorted and labelled by hour', () => {
    const early = aSession({ time: '06:00:00', occupied: 4 })
    const late = aSession({ time: '18:00:00', occupied: 7 })
    expect(byTimeSlot([late, early], ['2026-08-24'])).toEqual([
      { label: '06', value: 4 },
      { label: '18', value: 7 },
    ])
  })

  test('merges two sessions sharing an hour', () => {
    expect(
      byTimeSlot(
        [
          aSession({ time: '06:00:00', occupied: 4 }),
          aSession({ time: '06:00:00', occupied: 2 }),
        ],
        ['2026-08-24']
      )
    ).toEqual([{ label: '06', value: 6 }])
  })

  test('ignores sessions outside the window', () => {
    expect(
      byTimeSlot([aSession({ time: '06:00:00' })], ['2026-08-25'])
    ).toEqual([])
  })
})

describe('byWeekday', () => {
  test('returns every week day in order, with zeros where nothing happened', () => {
    const session = aSession({ sessionDate: '2026-08-24' })
    const result = byWeekday(
      [aCheckin({ workoutSessionId: session.id })],
      daysOf(session)
    )
    expect(result).toHaveLength(7)
    expect(result[0]).toEqual({ label: 'Seg', value: 1 })
    expect(result.slice(1).every((entry) => entry.value === 0)).toBe(true)
  })

  test('skips a check-in whose session is unknown', () => {
    const result = byWeekday(
      [aCheckin({ workoutSessionId: 'gone' })],
      new Map()
    )
    expect(result.every((entry) => entry.value === 0)).toBe(true)
  })
})

describe('trainingDays', () => {
  test('keeps only window days that actually have a session', () => {
    expect(
      trainingDays(
        [aSession({ sessionDate: '2026-08-24' })],
        ['2026-08-24', '2026-08-25']
      )
    ).toEqual(['2026-08-24'])
  })
})

describe('perMember', () => {
  test('counts distinct attended days and ranks by attendance', () => {
    const monday = aSession({ sessionDate: '2026-08-24' })
    const tuesday = aSession({ sessionDate: '2026-08-25' })
    const keen = aUser()
    const casual = aUser()
    const days = daysOf(monday, tuesday)

    const result = perMember(
      [
        aCheckin({ userId: keen.id, workoutSessionId: monday.id }),
        aCheckin({ userId: keen.id, workoutSessionId: tuesday.id }),
        aCheckin({ userId: casual.id, workoutSessionId: monday.id }),
      ],
      [casual, keen],
      days,
      ['2026-08-24', '2026-08-25']
    )

    expect(result[0]?.user.id).toBe(keen.id)
    expect(result[0]?.attended).toBe(2)
    expect(result[0]?.missed).toBe(0)
    expect(result[0]?.rate).toBe(1)
    expect(result[1]?.attended).toBe(1)
    expect(result[1]?.rate).toBe(0.5)
  })

  test('counts two check-ins on the same day once', () => {
    const session = aSession({ sessionDate: '2026-08-24' })
    const user = aUser()
    const result = perMember(
      [
        aCheckin({ userId: user.id, workoutSessionId: session.id }),
        aCheckin({ userId: user.id, workoutSessionId: session.id }),
      ],
      [user],
      daysOf(session),
      ['2026-08-24']
    )
    expect(result[0]?.attended).toBe(1)
  })

  test('excludes inactive members', () => {
    expect(perMember([], [aUser({ isActive: false })], new Map(), [])).toEqual(
      []
    )
  })

  test('never reports a negative missed count', () => {
    const session = aSession({ sessionDate: '2026-08-24' })
    const user = aUser()
    const result = perMember(
      [aCheckin({ userId: user.id, workoutSessionId: session.id })],
      [user],
      daysOf(session),
      []
    )
    expect(result[0]?.missed).toBe(0)
    expect(result[0]?.rate).toBe(0)
  })
})

describe('undoneInDays', () => {
  test('counts only undone check-ins inside the window', () => {
    const session = aSession({ sessionDate: '2026-08-24' })
    const days = daysOf(session)
    expect(
      undoneInDays(
        [
          aCheckin({ workoutSessionId: session.id, undone: true }),
          aCheckin({ workoutSessionId: session.id }),
        ],
        days,
        ['2026-08-24']
      )
    ).toBe(1)
  })

  test('is zero outside the window', () => {
    const session = aSession({ sessionDate: '2026-08-24' })
    expect(
      undoneInDays(
        [aCheckin({ workoutSessionId: session.id, undone: true })],
        daysOf(session),
        ['2026-08-25']
      )
    ).toBe(0)
  })
})

describe('lastUsedByWorkout', () => {
  test('keeps the most recent day a workout was used', () => {
    const latest = lastUsedByWorkout([
      aSession({ workoutId: 'w1', sessionDate: '2026-08-24' }),
      aSession({ workoutId: 'w1', sessionDate: '2026-09-02' }),
      aSession({ workoutId: 'w2', sessionDate: '2026-08-20' }),
    ])
    expect(latest.get('w1')).toBe('2026-09-02')
    expect(latest.get('w2')).toBe('2026-08-20')
  })

  test('is unaffected by the order sessions arrive in', () => {
    const latest = lastUsedByWorkout([
      aSession({ workoutId: 'w1', sessionDate: '2026-09-02' }),
      aSession({ workoutId: 'w1', sessionDate: '2026-08-24' }),
    ])
    expect(latest.get('w1')).toBe('2026-09-02')
  })
})

describe('dayLabel', () => {
  test('says Hoje for today', () => {
    expect(dayLabel('2026-08-24', '2026-08-24', '-')).toBe('Hoje')
  })

  test('formats any other day', () => {
    expect(dayLabel('2026-08-25', '2026-08-24', '-')).toBe('25 ago')
  })

  test('falls back when there is no day', () => {
    expect(dayLabel(undefined, '2026-08-24', 'Nunca')).toBe('Nunca')
  })
})

describe('toCsv', () => {
  test('joins cells with semicolons and rows with newlines', () => {
    expect(toCsv(['a', 'b'], [[1, 2]])).toBe('a;b\n1;2')
  })

  test('quotes a cell containing the separator', () => {
    expect(toCsv(['a'], [['x;y']])).toBe('a\n"x;y"')
  })

  test('quotes a cell containing a comma, a quote or a newline', () => {
    expect(toCsv(['a'], [['x,y']])).toBe('a\n"x,y"')
    expect(toCsv(['a'], [['say "hi"']])).toBe('a\n"say ""hi"""')
    expect(toCsv(['a'], [['line1\nline2']])).toBe('a\n"line1\nline2"')
  })

  test('writes just the header when there are no rows', () => {
    expect(toCsv(['a', 'b'], [])).toBe('a;b')
  })
})
