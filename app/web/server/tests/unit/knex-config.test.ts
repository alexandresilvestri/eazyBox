import { describe, expect, test } from 'bun:test'
import { config, snakeCaseIgnoringNumbers } from '../../db/knex.config'

const postProcess = config.postProcessResponse!
const wrap = config.wrapIdentifier!
const identity = (value: string) => value

describe('snakeCaseIgnoringNumbers', () => {
  test('snake cases a camelCase identifier', () => {
    expect(snakeCaseIgnoringNumbers('firstName')).toBe('first_name')
    expect(snakeCaseIgnoringNumbers('workoutScheduleId')).toBe(
      'workout_schedule_id'
    )
  })

  test('leaves an already lowercase identifier alone', () => {
    expect(snakeCaseIgnoringNumbers('wod')).toBe('wod')
    expect(snakeCaseIgnoringNumbers('deleted_at')).toBe('deleted_at')
  })

  test('does not split a trailing number off, as its name promises', () => {
    expect(snakeCaseIgnoringNumbers('address1')).toBe('address1')
    expect(snakeCaseIgnoringNumbers('line2Extra')).toBe('line2_extra')
  })

  test('handles an empty string', () => {
    expect(snakeCaseIgnoringNumbers('')).toBe('')
  })
})

describe('wrapIdentifier', () => {
  test('passes the star through untouched', () => {
    expect(wrap('*', identity, {})).toBe('*')
  })

  test('snake cases every other identifier', () => {
    expect(wrap('firstName', identity, {})).toBe('first_name')
  })
})

describe('postProcessResponse', () => {
  test('camel cases the keys of a single row', () => {
    expect(postProcess({ first_name: 'Ana', is_admin: true }, {})).toEqual({
      firstName: 'Ana',
      isAdmin: true,
    })
  })

  test('camel cases the keys of every row in an array', () => {
    expect(
      postProcess([{ week_day: 'monday' }, { week_day: 'tuesday' }], {})
    ).toEqual([{ weekDay: 'monday' }, { weekDay: 'tuesday' }])
  })

  test('preserves values, including null and nested objects', () => {
    const nested = { deleted_at: null, coach_id: null, raw: { keep_me: 1 } }
    expect(postProcess(nested, {})).toEqual({
      deletedAt: null,
      coachId: null,
      raw: { keep_me: 1 },
    })
  })

  test('passes null and undefined straight through', () => {
    expect(postProcess(null, {})).toBeNull()
    expect(postProcess(undefined, {})).toBeUndefined()
  })

  test('passes a scalar result through', () => {
    expect(postProcess(7, {})).toBe(7)
    expect(postProcess('ok', {})).toBe('ok')
  })

  test('leaves non-object rows inside an array alone', () => {
    expect(postProcess([1, 'two', null], {})).toEqual([1, 'two', null])
  })

  test('round-trips a column name through both directions', () => {
    const wrapped = wrap('workoutSessionId', identity, {}) as string
    expect(wrapped).toBe('workout_session_id')
    expect(postProcess({ [wrapped]: 'x' }, {})).toEqual({
      workoutSessionId: 'x',
    })
  })
})
