import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.raw('alter table users enable row level security')

  await knex.raw(`
    create policy users_select on users for select
      using (deleted_at is null and (id = app.current_user_id() or app.is_staff()))
  `)
  await knex.raw(`
    create policy users_insert on users for insert
      with check (app.is_admin())
  `)
  await knex.raw(`
    create policy users_update_self on users for update
      using (id = app.current_user_id() and deleted_at is null)
      with check (id = app.current_user_id())
  `)
  await knex.raw(`
    create policy users_update_admin on users for update
      using (app.is_admin())
      with check (app.is_admin())
  `)
  await knex.raw(`
    create policy users_delete on users for delete
      using (app.is_admin())
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
  await knex.raw(`
    create trigger users_guard_flags
      before update on users
      for each row execute function app.guard_user_flags()
  `)

  await knex.raw('alter table workouts enable row level security')
  await knex.raw(`
    create policy workouts_select on workouts for select
      using (deleted_at is null and app.is_authenticated())
  `)
  await knex.raw(`
    create policy workouts_write on workouts for all
      using (app.is_staff())
      with check (app.is_staff())
  `)

  await knex.raw('alter table workout_schedule enable row level security')
  await knex.raw(`
    create policy workout_schedule_select on workout_schedule for select
      using (deleted_at is null and app.is_authenticated())
  `)
  await knex.raw(`
    create policy workout_schedule_write on workout_schedule for all
      using (app.is_admin())
      with check (app.is_admin())
  `)

  await knex.raw('alter table workout_sessions enable row level security')
  await knex.raw(`
    create policy workout_sessions_select on workout_sessions for select
      using (deleted_at is null and app.is_authenticated())
  `)
  await knex.raw(`
    create policy workout_sessions_write on workout_sessions for all
      using (app.is_staff())
      with check (app.is_staff())
  `)

  await knex.raw('alter table checkins enable row level security')
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('drop trigger if exists users_guard_flags on users')
  await knex.raw('drop function if exists app.guard_user_flags()')

  for (const table of [
    'users',
    'workouts',
    'workout_schedule',
    'workout_sessions',
    'checkins',
  ]) {
    await knex.raw(`alter table ${table} disable row level security`)
  }

  for (const policy of [
    'users_select on users',
    'users_insert on users',
    'users_update_self on users',
    'users_update_admin on users',
    'users_delete on users',
    'workouts_select on workouts',
    'workouts_write on workouts',
    'workout_schedule_select on workout_schedule',
    'workout_schedule_write on workout_schedule',
    'workout_sessions_select on workout_sessions',
    'workout_sessions_write on workout_sessions',
  ]) {
    await knex.raw(`drop policy if exists ${policy}`)
  }
}
