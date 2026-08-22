import type { Knex } from 'knex'

const OWN_ROW = 'user_id = app.current_user_id()'

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    create policy checkins_select on checkins for select
      using (${OWN_ROW} or app.is_staff())
  `)
  await knex.raw(`
    create policy checkins_insert on checkins for insert
      with check (${OWN_ROW})
  `)
  await knex.raw(`
    create policy checkins_update on checkins for update
      using (${OWN_ROW})
      with check (${OWN_ROW})
  `)
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
