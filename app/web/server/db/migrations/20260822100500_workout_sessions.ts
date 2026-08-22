import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('workout_sessions', (t) => {
    t.uuid('id', { primaryKey: true }).defaultTo(knex.raw('uuid_generate_v4()'))
    t.uuid('workout_schedule_id')
      .notNullable()
      .references('id')
      .inTable('workout_schedule')
    t.uuid('workout_id').notNullable().references('id').inTable('workouts')
    t.specificType('week_day', 'week_day').notNullable()
    t.time('time').notNullable()
    t.date('session_date').notNullable()
    t.timestamps(true, true)
    t.timestamp('deleted_at', { useTz: true })
    t.unique(['workout_schedule_id', 'session_date'])
    t.index('session_date')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('workout_sessions')
}
