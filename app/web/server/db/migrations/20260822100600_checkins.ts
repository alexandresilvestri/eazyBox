import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('checkins', (t) => {
    t.uuid('id', { primaryKey: true }).defaultTo(knex.raw('uuid_generate_v4()'))
    t.uuid('user_id').notNullable().references('id').inTable('users')
    t.uuid('workout_session_id')
      .notNullable()
      .references('id')
      .inTable('workout_sessions')
    t.boolean('undone').notNullable().defaultTo(false)
    t.timestamp('created_at', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now())
    t.index('user_id')
    t.index('workout_session_id')
  })

  await knex.raw(
    'create unique index checkins_live_unique on checkins (user_id, workout_session_id) where undone = false'
  )
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('checkins')
}
