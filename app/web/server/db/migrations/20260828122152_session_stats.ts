import type { Knex } from 'knex'

const STATS = 'app.session_stats(date)'
const ATTENDEES = 'app.session_attendees(uuid)'

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    create or replace function app.session_stats(p_from date default null)
      returns table (
        workout_session_id uuid,
        occupied int,
        coach_id uuid,
        coach_first_name text,
        coach_last_name text
      )
      language sql stable security definer set search_path = public as $$
        select
          s.id,
          count(c.id)::int,
          coach.id,
          coach.first_name::text,
          coach.last_name::text
        from workout_sessions s
          left join checkins c
            on c.workout_session_id = s.id and c.undone = false
          left join users coach
            on coach.id = s.coach_id and coach.deleted_at is null
        where app.is_authenticated()
          and (p_from is null or s.session_date >= p_from)
        group by s.id, coach.id, coach.first_name, coach.last_name
      $$
  `)
  await knex.raw(`revoke all on function ${STATS} from public`)
  await knex.raw(`grant execute on function ${STATS} to app_user`)

  await knex.raw(`
    create or replace function app.session_attendees(p_session_id uuid)
      returns table (
        user_id uuid,
        first_name text,
        last_name text,
        is_coach boolean,
        checked_in_at timestamptz
      )
      language sql stable security definer set search_path = public as $$
        select u.id, u.first_name::text, u.last_name::text, u.is_coach,
          c.created_at
        from checkins c
          join users u on u.id = c.user_id
        where app.is_authenticated()
          and c.workout_session_id = p_session_id
          and c.undone = false
          and u.deleted_at is null
        order by u.first_name, u.last_name
      $$
  `)
  await knex.raw(`revoke all on function ${ATTENDEES} from public`)
  await knex.raw(`grant execute on function ${ATTENDEES} to app_user`)
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`drop function if exists ${ATTENDEES}`)
  await knex.raw(`drop function if exists ${STATS}`)
}
