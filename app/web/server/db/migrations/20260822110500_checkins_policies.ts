import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  // TODO(human): write the three checkins policies described below.
  //
  // await knex.raw(`
  //   create policy checkins_select on checkins for select
  //     using (...)
  // `)
  // await knex.raw(`
  //   create policy checkins_insert on checkins for insert
  //     with check (...)
  // `)
  // await knex.raw(`
  //   create policy checkins_update on checkins for update
  //     using (...)
  //     with check (...)
  // `)
}

export async function down(knex: Knex): Promise<void> {
  for (const policy of [
    'checkins_select on checkins',
    'checkins_insert on checkins',
    'checkins_update on checkins',
  ]) {
    await knex.raw(`drop policy if exists ${policy}`)
  }
}
