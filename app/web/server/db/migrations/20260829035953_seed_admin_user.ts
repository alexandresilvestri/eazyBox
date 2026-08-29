import type { Knex } from 'knex'

const EMAIL = 'admin@eazybox.dev'
const PASSWORD_HASH =
  '$argon2id$v=19$m=65536,t=2,p=1$vWGljOJWltNL6uvmwtxyaHSDFjjJR6LoM+go+/lSG58$UWGh04CbsnqFeb8LAUmOzv4THdZCKszB6yvtBpcn9mI'

export async function up(knex: Knex): Promise<void> {
  if (process.env.NODE_ENV === 'test') return

  await knex('users')
    .insert({
      email: EMAIL,
      password: PASSWORD_HASH,
      first_name: 'Admin',
      last_name: 'EazyBox',
      is_admin: true,
      is_active: true,
    })
    .onConflict('email')
    .merge({ is_admin: true, is_active: true, deleted_at: null })
}

export async function down(knex: Knex): Promise<void> {
  await knex('users').where({ email: EMAIL }).delete()
}
