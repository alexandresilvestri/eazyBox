import { describe, expect, test } from 'bun:test'
import { createUser } from '../helpers/factories'
import { bearer, tokenFor } from '../helpers/auth'
import { api } from '../helpers/request'
import { owner } from '../helpers/db'

const UNKNOWN_ID = '00000000-0000-0000-0000-000000000000'

const validPayload = {
  email: 'new@test.com',
  password: 'password123',
  firstName: 'New',
  lastName: 'User',
}

describe('authentication', () => {
  test('rejects a request with no token', async () => {
    const res = await api('GET', '/users')
    expect(res.status).toBe(401)
  })

  test('rejects a malformed token', async () => {
    const res = await api('GET', '/users', {
      headers: { Authorization: 'Bearer not-a-jwt' },
    })
    expect(res.status).toBe(401)
  })

  test('rejects an expired token', async () => {
    const user = await createUser()
    const token = await tokenFor(user, '-1s')
    const res = await api('GET', '/users', {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(res.status).toBe(401)
  })
})

describe('row isolation', () => {
  test('a member lists only their own row', async () => {
    const member = await createUser()
    await createUser()
    const res = await api('GET', '/users', { headers: await bearer(member) })
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
    expect(res.body[0].id).toBe(member.id)
  })

  test('an admin lists every row', async () => {
    const admin = await createUser({ isAdmin: true })
    await createUser()
    await createUser()
    const res = await api('GET', '/users', { headers: await bearer(admin) })
    expect(res.body).toHaveLength(3)
  })

  test('a coach lists every row', async () => {
    const coach = await createUser({ isCoach: true })
    await createUser()
    const res = await api('GET', '/users', { headers: await bearer(coach) })
    expect(res.body).toHaveLength(2)
  })

  test('reading another member returns 404, not 403', async () => {
    const member = await createUser()
    const other = await createUser()
    const res = await api('GET', `/users/${other.id}`, {
      headers: await bearer(member),
    })
    expect(res.status).toBe(404)
  })

  test('a member reads their own row', async () => {
    const member = await createUser()
    const res = await api('GET', `/users/${member.id}`, {
      headers: await bearer(member),
    })
    expect(res.status).toBe(200)
    expect(res.body.email).toBe(member.email)
  })
})

describe('create', () => {
  test('a member cannot create a user', async () => {
    const member = await createUser()
    const res = await api('POST', '/users', {
      headers: await bearer(member),
      body: validPayload,
    })
    expect(res.status).toBe(403)
  })

  test('a coach cannot create a user', async () => {
    const coach = await createUser({ isCoach: true })
    const res = await api('POST', '/users', {
      headers: await bearer(coach),
      body: validPayload,
    })
    expect(res.status).toBe(403)
  })

  test('an admin creates a user', async () => {
    const admin = await createUser({ isAdmin: true })
    const res = await api('POST', '/users', {
      headers: await bearer(admin),
      body: validPayload,
    })
    expect(res.status).toBe(201)
    expect(res.body.email).toBe(validPayload.email)
  })

  test('never returns the password hash', async () => {
    const admin = await createUser({ isAdmin: true })
    const res = await api('POST', '/users', {
      headers: await bearer(admin),
      body: validPayload,
    })
    expect(res.body).not.toHaveProperty('password')
  })

  test('rejects a duplicate email with 409', async () => {
    const admin = await createUser({ isAdmin: true })
    const headers = await bearer(admin)
    await api('POST', '/users', { headers, body: validPayload })
    const res = await api('POST', '/users', { headers, body: validPayload })
    expect(res.status).toBe(409)
  })

  test('rejects an invalid payload with 400 and issues', async () => {
    const admin = await createUser({ isAdmin: true })
    const res = await api('POST', '/users', {
      headers: await bearer(admin),
      body: { email: 'not-an-email', password: 'short' },
    })
    expect(res.status).toBe(400)
    expect(res.body.issues.length).toBeGreaterThan(0)
  })
})

describe('update', () => {
  test('a member updates their own name', async () => {
    const member = await createUser()
    const res = await api('PATCH', `/users/${member.id}`, {
      headers: await bearer(member),
      body: { firstName: 'Renamed' },
    })
    expect(res.status).toBe(200)
    expect(res.body.firstName).toBe('Renamed')
  })

  test('a member cannot promote themselves to admin', async () => {
    const member = await createUser()
    await api('PATCH', `/users/${member.id}`, {
      headers: await bearer(member),
      body: { firstName: 'X', isAdmin: true },
    })
    const row = await owner('users')
      .select('is_admin')
      .where({ id: member.id })
      .first()
    expect(row.is_admin).toBe(false)
  })

  test('a duplicate email on update returns 409, not 500', async () => {
    const admin = await createUser({ isAdmin: true })
    const taken = await createUser()
    const res = await api('PATCH', `/users/${admin.id}`, {
      headers: await bearer(admin),
      body: { email: taken.email },
    })
    expect(res.status).toBe(409)
  })

  test('updating another member returns 404', async () => {
    const member = await createUser()
    const other = await createUser()
    const res = await api('PATCH', `/users/${other.id}`, {
      headers: await bearer(member),
      body: { firstName: 'Hacked' },
    })
    expect(res.status).toBe(404)
  })
})

describe('delete', () => {
  test('an admin soft deletes a user, which then 404s', async () => {
    const admin = await createUser({ isAdmin: true })
    const victim = await createUser()
    const headers = await bearer(admin)

    const removed = await api('DELETE', `/users/${victim.id}`, { headers })
    expect(removed.status).toBe(204)

    const after = await api('GET', `/users/${victim.id}`, { headers })
    expect(after.status).toBe(404)

    const row = await owner('users')
      .select('deleted_at')
      .where({ id: victim.id })
      .first()
    expect(row.deleted_at).not.toBeNull()
  })

  test('a member cannot delete a user', async () => {
    const member = await createUser()
    const other = await createUser()
    const res = await api('DELETE', `/users/${other.id}`, {
      headers: await bearer(member),
    })
    expect(res.status).toBe(403)
  })
})

describe('role and status flags', () => {
  test('an admin promotes a member to coach', async () => {
    const admin = await createUser({ isAdmin: true })
    const member = await createUser()
    const res = await api('PATCH', `/users/${member.id}`, {
      headers: await bearer(admin),
      body: { isCoach: true },
    })
    expect(res.status).toBe(200)
    expect(res.body.isCoach).toBe(true)
  })

  test('an admin deactivates a member', async () => {
    const admin = await createUser({ isAdmin: true })
    const member = await createUser()
    const res = await api('PATCH', `/users/${member.id}`, {
      headers: await bearer(admin),
      body: { isActive: false },
    })
    expect(res.status).toBe(200)
    expect(res.body.isActive).toBe(false)
  })

  test('a member cannot promote itself', async () => {
    const member = await createUser()
    const res = await api('PATCH', `/users/${member.id}`, {
      headers: await bearer(member),
      body: { isCoach: true },
    })
    expect(res.status).toBe(403)
    const after = await api('GET', `/users/${member.id}`, {
      headers: await bearer(member),
    })
    expect(after.body.isCoach).toBe(false)
  })

  test('a coach cannot touch another member', async () => {
    const coach = await createUser({ isCoach: true })
    const member = await createUser()
    const res = await api('PATCH', `/users/${member.id}`, {
      headers: await bearer(coach),
      body: { isActive: false },
    })
    expect(res.status).toBe(404)
  })
})

describe('error arms', () => {
  test('an invalid payload on update returns 400 with issues', async () => {
    const admin = await createUser({ isAdmin: true })
    const member = await createUser()
    const res = await api('PATCH', `/users/${member.id}`, {
      headers: await bearer(admin),
      body: { email: 'not-an-email' },
    })
    expect(res.status).toBe(400)
    expect(res.body.issues.length).toBeGreaterThan(0)
  })

  test('a malformed json body on create returns 400', async () => {
    const admin = await createUser({ isAdmin: true })
    const res = await api('POST', '/users', { headers: await bearer(admin) })
    expect(res.status).toBe(400)
  })

  test('deleting an unknown user returns 404', async () => {
    const admin = await createUser({ isAdmin: true })
    const res = await api('DELETE', `/users/${UNKNOWN_ID}`, {
      headers: await bearer(admin),
    })
    expect(res.status).toBe(404)
  })
})
