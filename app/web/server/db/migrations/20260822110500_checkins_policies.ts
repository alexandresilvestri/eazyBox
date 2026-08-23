import type { Knex } from 'knex'

const OWN_ROW = 'user_id = app.current_user_id()'

export async function up(knex: Knex): Promise<void> {
  await knex.raw('alter table checkins enable row level security')
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
  for (const name of [
    'checkins_select',
    'checkins_insert',
    'checkins_update',
  ]) {
    await knex.raw(`drop policy if exists ${name} on checkins`)
  }
  await knex.raw('alter table checkins disable row level security')
}
