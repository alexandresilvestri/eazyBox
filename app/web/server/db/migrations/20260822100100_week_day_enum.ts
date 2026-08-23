import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.raw(
    "create type week_day as enum ('monday','tuesday','wednesday','thursday','friday','saturday','sunday')"
  )
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('drop type if exists week_day')
}
