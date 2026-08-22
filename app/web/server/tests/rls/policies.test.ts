import { describe, expect, test } from 'bun:test'
import type { Knex } from 'knex'
import { db } from '../../db/db'
import { createSession, createUser } from '../helpers/factories'
import { owner } from '../helpers/db'

const SET_IDENTITY = `
  select
    set_config('app.user_id', ?, true),
    set_config('app.is_admin', ?, true),
    set_config('app.is_coach', ?, true)
`

type Identity = { userId?: string; isAdmin?: boolean; isCoach?: boolean }

async function asRole<T>(
  { userId = '', isAdmin = false, isCoach = false }: Identity,
  work: (trx: Knex.Transaction) => Promise<T>
) {
  return db.transaction(async (trx) => {
    await trx.raw(SET_IDENTITY, [userId, String(isAdmin), String(isCoach)])
    return work(trx)
  })
}

const countOf = async (identity: Identity, table: string) => {
  const rows = await asRole(identity, (trx) => trx(table).count('* as n'))
  return Number(rows[0]?.n ?? 0)
}

describe('users policies', () => {
  test('a member sees only their own row', async () => {
    const member = await createUser()
    await createUser()
    expect(await countOf({ userId: member.id }, 'users')).toBe(1)
  })

  test('an admin sees every row', async () => {
    const admin = await createUser({ isAdmin: true })
    await createUser()
    expect(await countOf({ userId: admin.id, isAdmin: true }, 'users')).toBe(2)
  })

  test('an unset identity sees nothing', async () => {
    await createUser()
    await createUser()
    expect(await countOf({}, 'users')).toBe(0)
  })

  test('the owner connection bypasses policies', async () => {
    await createUser()
    const rows = await owner('users').count('* as n')
    expect(Number(rows[0]?.n ?? 0)).toBe(1)
  })

  test('a member cannot flip their own admin flag', async () => {
    const member = await createUser()
    await expect(
      asRole({ userId: member.id }, (trx) =>
        trx('users').where({ id: member.id }).update({ is_admin: true })
      )
    ).rejects.toThrow(/insufficient privilege/)
  })
})

describe('checkins policies', () => {
  test('a member inserts their own check-in', async () => {
    const member = await createUser()
    const { id: sessionId } = await createSession()
    const inserted = await asRole({ userId: member.id }, (trx) =>
      trx('checkins').insert({ user_id: member.id, workout_session_id: sessionId })
    )
    expect(inserted).toBeDefined()
    expect(await countOf({ userId: member.id }, 'checkins')).toBe(1)
  })

  test('a member cannot insert under another user id', async () => {
    const member = await createUser()
    const other = await createUser()
    const { id: sessionId } = await createSession()
    await expect(
      asRole({ userId: member.id }, (trx) =>
        trx('checkins').insert({ user_id: other.id, workout_session_id: sessionId })
      )
    ).rejects.toThrow(/row-level security/)
  })

  test('a second live check-in is rejected', async () => {
    const member = await createUser()
    const { id: sessionId } = await createSession()
    const row = { user_id: member.id, workout_session_id: sessionId }
    await asRole({ userId: member.id }, (trx) => trx('checkins').insert(row))
    await expect(
      asRole({ userId: member.id }, (trx) => trx('checkins').insert(row))
    ).rejects.toThrow(/checkins_live_unique/)
  })

  test('re-checking in after undo is allowed', async () => {
    const member = await createUser()
    const { id: sessionId } = await createSession()
    const row = { user_id: member.id, workout_session_id: sessionId }
    await asRole({ userId: member.id }, (trx) => trx('checkins').insert(row))
    await asRole({ userId: member.id }, (trx) =>
      trx('checkins').where(row).update({ undone: true })
    )
    await asRole({ userId: member.id }, (trx) => trx('checkins').insert(row))
    expect(await countOf({ userId: member.id }, 'checkins')).toBe(2)
  })

  test('a member cannot touch another member check-in', async () => {
    const member = await createUser()
    const other = await createUser()
    const { id: sessionId } = await createSession()
    await owner('checkins').insert({
      user_id: other.id,
      workout_session_id: sessionId,
    })

    const updated = await asRole({ userId: member.id }, (trx) =>
      trx('checkins').where({ user_id: other.id }).update({ undone: true })
    )
    expect(updated).toBe(0)
    expect(await countOf({ userId: member.id }, 'checkins')).toBe(0)
  })

  test('staff see every check-in', async () => {
    const coach = await createUser({ isCoach: true })
    const member = await createUser()
    const { id: sessionId } = await createSession()
    await owner('checkins').insert({
      user_id: member.id,
      workout_session_id: sessionId,
    })
    expect(await countOf({ userId: coach.id, isCoach: true }, 'checkins')).toBe(1)
  })
})

describe('staff-write tables', () => {
  test('a member cannot insert a workout', async () => {
    const member = await createUser()
    await expect(
      asRole({ userId: member.id }, (trx) => trx('workouts').insert({ wod: 'x' }))
    ).rejects.toThrow(/row-level security/)
  })

  test('a coach can insert a workout but not a schedule slot', async () => {
    const coach = await createUser({ isCoach: true })
    const identity = { userId: coach.id, isCoach: true }
    await asRole(identity, (trx) => trx('workouts').insert({ wod: 'Murph' }))
    expect(await countOf(identity, 'workouts')).toBe(1)

    await expect(
      asRole(identity, (trx) =>
        trx('workout_schedule').insert({ week_day: 'friday', time: '18:00' })
      )
    ).rejects.toThrow(/row-level security/)
  })
})
