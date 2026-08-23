import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    create or replace function app.find_login(p_email text)
      returns table (
        id uuid,
        password text,
        is_admin boolean,
        is_coach boolean,
        is_active boolean
      )
      language sql stable security definer set search_path = public as $$
        select u.id, u.password::text, u.is_admin, u.is_coach, u.is_active
        from users u
        where u.email = p_email and u.deleted_at is null
      $$
  `)

  await knex.raw('revoke all on function app.find_login(text) from public')
  await knex.raw('grant execute on function app.find_login(text) to app_user')
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('drop function if exists app.find_login(text)')
}
