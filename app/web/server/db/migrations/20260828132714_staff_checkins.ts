import type { Knex } from 'knex'

const OWN_ROW = 'user_id = app.current_user_id()'

const replaceInsertPolicy = async (knex: Knex, check: string) => {
  await knex.raw('drop policy if exists checkins_insert on checkins')
  await knex.raw(`
    create policy checkins_insert on checkins for insert
      with check (${check})
  `)
}

export async function up(knex: Knex): Promise<void> {
  await replaceInsertPolicy(knex, `${OWN_ROW} or app.is_staff()`)
}

export async function down(knex: Knex): Promise<void> {
  await replaceInsertPolicy(knex, OWN_ROW)
}
