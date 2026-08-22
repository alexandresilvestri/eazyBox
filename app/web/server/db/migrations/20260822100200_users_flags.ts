import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', (t) => {
    t.boolean('is_active').notNullable().defaultTo(true)
    t.boolean('is_admin').notNullable().defaultTo(false)
    t.boolean('is_coach').notNullable().defaultTo(false)
    t.timestamp('deleted_at', { useTz: true })
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', (t) => {
    t.dropColumns('is_active', 'is_admin', 'is_coach', 'deleted_at')
  })
}
