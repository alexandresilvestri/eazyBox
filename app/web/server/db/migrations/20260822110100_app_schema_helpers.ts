import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.raw('create schema if not exists app')

  await knex.raw(`
    create or replace function app.current_user_id() returns uuid
      language sql stable parallel safe as $$
        select nullif(current_setting('app.user_id', true), '')::uuid
      $$
  `)

  await knex.raw(`
    create or replace function app.is_admin() returns boolean
      language sql stable parallel safe as $$
        select coalesce(current_setting('app.is_admin', true) = 'true', false)
      $$
  `)

  await knex.raw(`
    create or replace function app.is_staff() returns boolean
      language sql stable parallel safe as $$
        select app.is_admin()
          or coalesce(current_setting('app.is_coach', true) = 'true', false)
      $$
  `)

  await knex.raw(`
    create or replace function app.is_authenticated() returns boolean
      language sql stable parallel safe as $$
        select app.current_user_id() is not null
      $$
  `)

  await knex.raw(`
    create or replace function app.guard_user_flags() returns trigger
      language plpgsql as $$
      begin
        if app.current_user_id() is null or app.is_admin() then
          return new;
        end if;

        if new.is_admin is distinct from old.is_admin
          or new.is_coach is distinct from old.is_coach
          or new.is_active is distinct from old.is_active then
          raise exception 'insufficient privilege to change user flags'
            using errcode = '42501';
        end if;

        return new;
      end
      $$
  `)
}

export async function down(knex: Knex): Promise<void> {
  for (const fn of [
    'app.guard_user_flags()',
    'app.is_authenticated()',
    'app.is_staff()',
    'app.is_admin()',
    'app.current_user_id()',
  ]) {
    await knex.raw(`drop function if exists ${fn}`)
  }
  await knex.raw('drop schema if exists app')
}
