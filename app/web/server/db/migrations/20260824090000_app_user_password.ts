import type { Knex } from 'knex'

const APP_ROLE = 'app_user'
const PASSWORD_SETTING = 'app.bootstrap_password'

export async function up(knex: Knex): Promise<void> {
  const password = process.env.APP_USER_PASSWORD
  if (!password) return

  await knex.raw(`select set_config('${PASSWORD_SETTING}', ?, true)`, [
    password,
  ])
  await knex.raw(`
    do $$
    begin
      execute format(
        'alter role %I with password %L',
        '${APP_ROLE}',
        current_setting('${PASSWORD_SETTING}', true)
      );
    end
    $$
  `)
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`alter role ${APP_ROLE} with password null`)
}
