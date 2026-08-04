import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('users', (t) => {
    t.uuid('id', { primaryKey: true }).defaultTo(knex.raw('uuid_generate_v4()'))
    t.string('email').notNullable().unique()
    t.string('password').notNullable()
    t.string('first_name').notNullable()
    t.string('last_name').notNullable()
    t.timestamps(true, true)
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('users')
}

