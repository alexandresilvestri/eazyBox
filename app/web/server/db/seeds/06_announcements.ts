import type { Knex } from 'knex'

const HOUR_MS = 60 * 60 * 1000

const NOTICES = [
  { body: 'Sábado tem Team WOD às 09:00', hoursAgo: 2 },
  {
    body: 'A aula das 06:00 de segunda começa 15 min mais tarde',
    hoursAgo: 26,
  },
  {
    body: 'Novos kettlebells de 24kg chegaram, cuidado ao devolver no rack',
    hoursAgo: 74,
  },
]

export async function seed(knex: Knex) {
  const [author]: { id: string }[] = await knex('users')
    .select('id')
    .where({ isAdmin: true })

  const now = Date.now()

  await knex('announcements').insert(
    NOTICES.map(({ body, hoursAgo }) => ({
      body,
      authorId: author?.id ?? null,
      createdAt: new Date(now - hoursAgo * HOUR_MS),
      updatedAt: new Date(now - hoursAgo * HOUR_MS),
    }))
  )
}
