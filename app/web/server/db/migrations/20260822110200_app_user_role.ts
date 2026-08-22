import type { Knex } from 'knex'

const APP_ROLE = 'app_user'

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    do $$
    begin
      if not exists (select 1 from pg_roles where rolname = '${APP_ROLE}') then
        create role ${APP_ROLE} login;
      end if;
    end
    $$
  `)

  const password = process.env.APP_DB_PASSWORD
  if (password) {
    await knex.raw("select set_config('app.bootstrap_password', ?, false)", [
      password,
    ])
    await knex.raw(`
      do $$
      begin
        execute format(
          'alter role ${APP_ROLE} with password %L',
          current_setting('app.bootstrap_password')
        );
      end
      $$
    `)
  }

  await knex.raw(`grant usage on schema public, app to ${APP_ROLE}`)
  await knex.raw(
    `grant select, insert, update, delete on all tables in schema public to ${APP_ROLE}`
  )
  await knex.raw(`
    alter default privileges in schema public
      grant select, insert, update, delete on tables to ${APP_ROLE}
  `)
  await knex.raw(
    `revoke all on knex_migrations, knex_migrations_lock from ${APP_ROLE}`
  )
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    alter default privileges in schema public
      revoke select, insert, update, delete on tables from ${APP_ROLE}
  `)
  await knex.raw(
    `revoke all on all tables in schema public from ${APP_ROLE}`
  )
  await knex.raw(`revoke usage on schema public, app from ${APP_ROLE}`)
  await knex.raw(`drop role if exists ${APP_ROLE}`)
}
