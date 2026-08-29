import type { Knex } from 'knex'

const EMAIL = 'demo@eazybox.com.br'
const PASSWORD_HASH =
  '$argon2id$v=19$m=65536,t=2,p=1$99NxRA1BLD7L+rvyi/DPJjYUd9u3BNkIx5FlTR3Giw0$t+It5t22hFux+KfEbA+++g8iA/n3sePSPea2a1x6bi0'

export async function up(knex: Knex): Promise<void> {
  if (process.env.NODE_ENV === 'test') return

  await knex('users')
    .insert({
      email: EMAIL,
      password: PASSWORD_HASH,
      first_name: 'Demo',
      last_name: 'EazyBox',
      is_admin: false,
      is_coach: false,
      is_active: true,
    })
    .onConflict('email')
    .merge({
      is_admin: false,
      is_coach: false,
      is_active: true,
      deleted_at: null,
    })
}

export async function down(knex: Knex): Promise<void> {
  await knex('users').where({ email: EMAIL }).delete()
}
