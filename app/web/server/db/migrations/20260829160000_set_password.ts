import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    create or replace function app.set_password(p_user_id uuid, p_digest text)
      returns boolean
      language sql security definer set search_path = public as $$
        update users u
        set password = p_digest, updated_at = now()
        where u.id = p_user_id and u.deleted_at is null
        returning true
      $$
  `)

  await knex.raw(
    'revoke all on function app.set_password(uuid, text) from public'
  )
  await knex.raw(
    'grant execute on function app.set_password(uuid, text) to app_user'
  )
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('drop function if exists app.set_password(uuid, text)')
}
