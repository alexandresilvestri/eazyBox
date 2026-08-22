import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.raw('create schema if not exists app')

  await knex.raw(`
    create or replace function app.current_user_id() returns uuid
      language sql stable as $$
        select nullif(current_setting('app.user_id', true), '')::uuid
      $$
  `)

  await knex.raw(`
    create or replace function app.is_admin() returns boolean
      language sql stable as $$
        select coalesce(current_setting('app.is_admin', true) = 'true', false)
      $$
  `)

  await knex.raw(`
    create or replace function app.is_staff() returns boolean
      language sql stable as $$
        select app.is_admin()
          or coalesce(current_setting('app.is_coach', true) = 'true', false)
      $$
  `)

  await knex.raw(`
    create or replace function app.is_authenticated() returns boolean
      language sql stable as $$
        select app.current_user_id() is not null
      $$
  `)
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('drop schema if exists app cascade')
}
