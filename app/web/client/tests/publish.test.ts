import { afterEach, describe, expect, mock, test } from 'bun:test'
import { publishDay, slotsToPublish } from '../lib/publish'
import { aSession, aSlot } from './fixtures'

const realFetch = globalThis.fetch

type Call = { path: string; body: Record<string, unknown> }

const stubFetch = (statusFor: (call: Call) => number) => {
  const calls: Call[] = []
  globalThis.fetch = mock(async (input: unknown, init: RequestInit = {}) => {
    const call = {
      path: String(input),
      body: JSON.parse(String(init.body)) as Record<string, unknown>,
    }
    calls.push(call)
    const status = statusFor(call)
    return new Response(status === 204 ? null : JSON.stringify({ id: 'x' }), {
      status,
    })
  }) as unknown as typeof fetch
  return calls
}

afterEach(() => {
  globalThis.fetch = realFetch
})

describe('slotsToPublish', () => {
  test('returns the slots of that week day that have no session yet', () => {
    const monday = aSlot({ weekDay: 'monday', time: '06:00:00' })
    const alsoMonday = aSlot({ weekDay: 'monday', time: '18:00:00' })
    const tuesday = aSlot({ weekDay: 'tuesday' })

    expect(
      slotsToPublish([monday, alsoMonday, tuesday], [], '2026-08-24')
    ).toEqual([monday, alsoMonday])
  })

  test('excludes a slot already published for that day', () => {
    const published = aSlot({ weekDay: 'monday', time: '06:00:00' })
    const pending = aSlot({ weekDay: 'monday', time: '18:00:00' })
    const session = aSession({
      workoutScheduleId: published.id,
      sessionDate: '2026-08-24',
    })

    expect(
      slotsToPublish([published, pending], [session], '2026-08-24')
    ).toEqual([pending])
  })

  test('excludes slots belonging to another week day', () => {
    expect(
      slotsToPublish([aSlot({ weekDay: 'tuesday' })], [], '2026-08-24')
    ).toEqual([])
  })

  test('reads the week day from the day string, not from the machine timezone', () => {
    const sunday = aSlot({ weekDay: 'sunday' })
    expect(slotsToPublish([sunday], [], '2026-08-23')).toEqual([sunday])
    expect(slotsToPublish([sunday], [], '2026-08-24')).toEqual([])
  })

  test('returns nothing when every slot is already published', () => {
    const slot = aSlot({ weekDay: 'monday' })
    const session = aSession({ workoutScheduleId: slot.id })
    expect(slotsToPublish([slot], [session], '2026-08-24')).toEqual([])
  })

  test('returns nothing for an empty schedule', () => {
    expect(slotsToPublish([], [], '2026-08-24')).toEqual([])
  })
})

describe('publishDay', () => {
  test('posts one session per slot, carrying the day and the workout', async () => {
    const slots = [aSlot(), aSlot()]
    const calls = stubFetch(() => 201)

    const failures = await publishDay(slots, '2026-08-24', 'workout-9')

    expect(failures).toBe(0)
    expect(calls).toHaveLength(2)
    expect(calls[0]?.path).toBe('/api/workout-sessions')
    expect(calls[0]?.body).toEqual({
      workoutScheduleId: slots[0]?.id,
      workoutId: 'workout-9',
      sessionDate: '2026-08-24',
    })
  })

  test('counts the slots the API rejected', async () => {
    const slots = [aSlot(), aSlot(), aSlot()]
    const calls: string[] = []
    stubFetch((call) => {
      calls.push(call.path)
      return calls.length === 1 ? 201 : 409
    })

    expect(await publishDay(slots, '2026-08-24', 'workout-9')).toBe(2)
  })

  test('reports every slot as failed when the API is down', async () => {
    const slots = [aSlot(), aSlot()]
    stubFetch(() => 500)
    expect(await publishDay(slots, '2026-08-24', 'workout-9')).toBe(2)
  })

  test('does nothing and reports no failures for an empty slot list', async () => {
    const calls = stubFetch(() => 201)
    expect(await publishDay([], '2026-08-24', 'workout-9')).toBe(0)
    expect(calls).toHaveLength(0)
  })

  test('publishes the remaining slots even though one fails', async () => {
    const slots = [aSlot(), aSlot(), aSlot()]
    const calls = stubFetch((call) =>
      call.body.workoutScheduleId === slots[1]?.id ? 409 : 201
    )

    expect(await publishDay(slots, '2026-08-24', 'workout-9')).toBe(1)
    expect(calls).toHaveLength(3)
  })
})
