import { describe, expect, test } from 'bun:test'
import { createAnnouncement, createUser } from '../helpers/factories'
import { bearer } from '../helpers/auth'
import { api } from '../helpers/request'

const UNKNOWN_ID = '00000000-0000-0000-0000-000000000000'

describe('read access', () => {
  test('a member lists the announcements', async () => {
    const member = await createUser()
    await createAnnouncement('Sábado tem Team WOD às 09:00')
    const res = await api('GET', '/announcements', {
      headers: await bearer(member),
    })
    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
    expect(res.body[0].body).toBe('Sábado tem Team WOD às 09:00')
  })

  test('requires a token', async () => {
    expect((await api('GET', '/announcements')).status).toBe(401)
  })
})

describe('write access', () => {
  test('a member cannot post an announcement', async () => {
    const member = await createUser()
    const res = await api('POST', '/announcements', {
      headers: await bearer(member),
      body: { body: 'Aviso' },
    })
    expect(res.status).toBe(403)
  })

  test('a coach posts an announcement and becomes its author', async () => {
    const coach = await createUser({ isCoach: true })
    const res = await api('POST', '/announcements', {
      headers: await bearer(coach),
      body: { body: 'Aula das 06:00 atrasada' },
    })
    expect(res.status).toBe(201)
    expect(res.body.authorId).toBe(coach.id)
  })

  test('an empty body returns 400', async () => {
    const coach = await createUser({ isCoach: true })
    const res = await api('POST', '/announcements', {
      headers: await bearer(coach),
      body: { body: '  ' },
    })
    expect(res.status).toBe(400)
  })

  test('a coach edits an announcement', async () => {
    const coach = await createUser({ isCoach: true })
    const id = await createAnnouncement()
    const res = await api('PATCH', `/announcements/${id}`, {
      headers: await bearer(coach),
      body: { body: 'Texto novo' },
    })
    expect(res.status).toBe(200)
    expect(res.body.body).toBe('Texto novo')
  })

  test('editing an unknown announcement returns 404', async () => {
    const coach = await createUser({ isCoach: true })
    const res = await api('PATCH', `/announcements/${UNKNOWN_ID}`, {
      headers: await bearer(coach),
      body: { body: 'Texto novo' },
    })
    expect(res.status).toBe(404)
  })

  test('a soft deleted announcement disappears from the list', async () => {
    const coach = await createUser({ isCoach: true })
    const headers = await bearer(coach)
    const id = await createAnnouncement()

    expect(
      (await api('DELETE', `/announcements/${id}`, { headers })).status
    ).toBe(204)
    expect((await api('GET', '/announcements', { headers })).body).toHaveLength(
      0
    )
  })
})

describe('error arms', () => {
  test('an invalid payload on update returns 400 with issues', async () => {
    const coach = await createUser({ isCoach: true })
    const id = await createAnnouncement()
    const res = await api('PATCH', `/announcements/${id}`, {
      headers: await bearer(coach),
      body: { body: '' },
    })
    expect(res.status).toBe(400)
    expect(res.body.issues.length).toBeGreaterThan(0)
  })

  test('deleting an unknown announcement returns 404', async () => {
    const coach = await createUser({ isCoach: true })
    const res = await api('DELETE', `/announcements/${UNKNOWN_ID}`, {
      headers: await bearer(coach),
    })
    expect(res.status).toBe(404)
  })
})
