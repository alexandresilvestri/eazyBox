import type { Knex } from 'knex'

const DEFAULT_CAPACITY = 20

const TABLES = ['workout_schedule', 'workout_sessions']

export async function up(knex: Knex): Promise<void> {
  for (const table of TABLES) {
    await knex.schema.alterTable(table, (t) => {
      t.integer('capacity').notNullable().defaultTo(DEFAULT_CAPACITY)
      t.uuid('coach_id').references('id').inTable('users').onDelete('SET NULL')
      t.index('coach_id')
    })
  }
}

export async function down(knex: Knex): Promise<void> {
  for (const table of TABLES) {
    await knex.schema.alterTable(table, (t) => {
      t.dropIndex('coach_id')
      t.dropColumns('coach_id', 'capacity')
    })
  }
}
