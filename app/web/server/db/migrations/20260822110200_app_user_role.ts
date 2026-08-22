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
  await knex.raw(`drop owned by ${APP_ROLE}`)
  await knex.raw(`drop role if exists ${APP_ROLE}`)
}
