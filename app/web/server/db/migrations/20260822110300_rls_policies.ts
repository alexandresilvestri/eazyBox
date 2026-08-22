import type { Knex } from 'knex'

const GUARDED_TABLES = [
  ['workouts', 'app.is_staff()'],
  ['workout_schedule', 'app.is_admin()'],
  ['workout_sessions', 'app.is_staff()'],
] as const

const USER_POLICIES = [
  `create policy users_select on users for select
     using (id = app.current_user_id() or app.is_staff())`,
  `create policy users_insert on users for insert
     with check (app.is_admin())`,
  `create policy users_update_self on users for update
     using (id = app.current_user_id() and deleted_at is null)
     with check (id = app.current_user_id())`,
  `create policy users_update_admin on users for update
     using (app.is_admin())
     with check (app.is_admin())`,
  `create policy users_delete on users for delete
     using (app.is_admin())`,
]

export async function up(knex: Knex): Promise<void> {
  await knex.raw('alter table users enable row level security')
  for (const policy of USER_POLICIES) {
    await knex.raw(policy)
  }
  await knex.raw(`
    create trigger users_guard_flags
      before update on users
      for each row execute function app.guard_user_flags()
  `)

  for (const [table, writeGuard] of GUARDED_TABLES) {
    await knex.raw(`alter table ${table} enable row level security`)
    await knex.raw(`
      create policy ${table}_select on ${table} for select
        using (app.is_authenticated())
    `)
    await knex.raw(`
      create policy ${table}_write on ${table} for all
        using (${writeGuard})
        with check (${writeGuard})
    `)
  }
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('drop trigger if exists users_guard_flags on users')

  for (const [table] of GUARDED_TABLES) {
    for (const suffix of ['select', 'write']) {
      await knex.raw(`drop policy if exists ${table}_${suffix} on ${table}`)
    }
    await knex.raw(`alter table ${table} disable row level security`)
  }

  for (const name of [
    'users_select',
    'users_insert',
    'users_update_self',
    'users_update_admin',
    'users_delete',
  ]) {
    await knex.raw(`drop policy if exists ${name} on users`)
  }
  await knex.raw('alter table users disable row level security')
}
