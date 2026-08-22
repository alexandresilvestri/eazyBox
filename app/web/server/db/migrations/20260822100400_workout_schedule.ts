import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('workout_schedule', (t) => {
    t.uuid('id', { primaryKey: true }).defaultTo(knex.raw('uuid_generate_v4()'))
    t.specificType('week_day', 'week_day').notNullable()
    t.time('time').notNullable()
    t.timestamps(true, true)
    t.timestamp('deleted_at', { useTz: true })
  })

  await knex.raw(
    'create unique index workout_schedule_slot_unique on workout_schedule (week_day, time) where deleted_at is null'
  )
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('workout_schedule')
}
