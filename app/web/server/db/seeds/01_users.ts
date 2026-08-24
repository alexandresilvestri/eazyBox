import type { Knex } from 'knex'

export const SEED_PASSWORD = 'eazybox123'

const FIRST_NAMES = [
  'Ana',
  'Bruno',
  'Carla',
  'Diego',
  'Eduarda',
  'Felipe',
  'Gabriela',
  'Henrique',
  'Isabela',
  'Joao',
  'Larissa',
  'Marcelo',
  'Natalia',
  'Otavio',
  'Patricia',
  'Rafael',
  'Sabrina',
  'Thiago',
  'Vanessa',
  'Wagner',
  'Yasmin',
  'Caio',
  'Bianca',
  'Leandro',
  'Mariana',
]

const LAST_NAMES = [
  'Silva',
  'Souza',
  'Oliveira',
  'Costa',
  'Pereira',
  'Almeida',
  'Rodrigues',
  'Ferreira',
  'Carvalho',
  'Ribeiro',
  'Martins',
  'Barbosa',
  'Rocha',
  'Dias',
  'Nunes',
  'Moreira',
  'Cardoso',
  'Teixeira',
  'Correia',
  'Pinto',
  'Melo',
  'Freitas',
  'Gomes',
  'Araujo',
  'Lima',
]

const ADMIN_INDEX = 0
const COACH_INDEXES = new Set([1, 2])
const INACTIVE_INDEXES = new Set([20, 21])
const DELETED_INDEX = 22

export async function seed(knex: Knex) {
  const password = await Bun.password.hash(SEED_PASSWORD)

  const users = FIRST_NAMES.map((firstName, index) => {
    const lastName = LAST_NAMES[index]
    return {
      email: `${firstName}.${lastName}@eazybox.dev`.toLowerCase(),
      password,
      firstName,
      lastName,
      isAdmin: index === ADMIN_INDEX,
      isCoach: COACH_INDEXES.has(index),
      isActive: !INACTIVE_INDEXES.has(index),
      deletedAt: index === DELETED_INDEX ? new Date() : null,
    }
  })

  await knex('users').insert(users)
}
