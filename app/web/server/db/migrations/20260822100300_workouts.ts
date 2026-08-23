import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('workouts', (t) => {
    t.uuid('id', { primaryKey: true }).defaultTo(knex.raw('uuid_generate_v4()'))
    t.text('warm_up')
    t.text('skill')
    t.text('wod').notNullable()
    t.timestamps(true, true)
    t.timestamp('deleted_at', { useTz: true })
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('workouts')
}
