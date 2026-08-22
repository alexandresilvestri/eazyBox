import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    create or replace function app.find_identity(p_id uuid)
      returns table (
        id uuid,
        is_admin boolean,
        is_coach boolean,
        is_active boolean
      )
      language sql stable security definer set search_path = public as $$
        select u.id, u.is_admin, u.is_coach, u.is_active
        from users u
        where u.id = p_id and u.deleted_at is null
      $$
  `)
  await knex.raw('revoke all on function app.find_identity(uuid) from public')
  await knex.raw(
    'grant execute on function app.find_identity(uuid) to app_user'
  )
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('drop function if exists app.find_identity(uuid)')
}
