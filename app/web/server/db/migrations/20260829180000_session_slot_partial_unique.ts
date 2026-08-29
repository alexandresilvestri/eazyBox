import type { Knex } from 'knex'

const INDEX_NAME = 'workout_sessions_slot_date_unique'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('workout_sessions', (t) => {
    t.dropUnique(['workout_schedule_id', 'session_date'])
    t.unique(['workout_schedule_id', 'session_date'], {
      indexName: INDEX_NAME,
      predicate: knex.whereNull('deleted_at'),
    })
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`drop index if exists ${INDEX_NAME}`)
  await knex.schema.alterTable('workout_sessions', (t) => {
    t.unique(['workout_schedule_id', 'session_date'])
  })
}
