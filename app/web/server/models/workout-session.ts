import type { Knex } from 'knex'
import type { SessionAttendee, WorkoutSession } from '@eazybox/shared'

const COLUMNS: (keyof WorkoutSession)[] = [
  'id',
  'workoutScheduleId',
  'workoutId',
  'weekDay',
  'time',
  'sessionDate',
  'capacity',
  'coachId',
  'createdAt',
  'updatedAt',
]

export type SessionStatsRow = {
  workoutSessionId: string
  occupied: number
  coachId: string | null
  coachFirstName: string | null
  coachLastName: string | null
}

export class WorkoutSessionModel {
  constructor(private readonly db: Knex) {}

  findAll(from?: string) {
    const query = this.db<WorkoutSession>('workout_sessions')
      .select(COLUMNS)
      .whereNull('deletedAt')
      .orderBy(['sessionDate', 'time'])
    return from ? query.where('sessionDate', '>=', from) : query
  }

  findStats(from?: string) {
    return this.db
      .select<SessionStatsRow[]>('*')
      .from(this.db.raw('app.session_stats(?)', [from ?? null]))
  }

  findAttendees(id: string) {
    return this.db
      .select<SessionAttendee[]>('*')
      .from(this.db.raw('app.session_attendees(?)', [id]))
  }

  findById(id: string) {
    return this.db<WorkoutSession>('workout_sessions')
      .select(COLUMNS)
      .where({ id })
      .whereNull('deletedAt')
      .first()
  }

  async insert(input: Partial<WorkoutSession>) {
    const [row] = await this.db('workout_sessions')
      .insert(input)
      .returning(COLUMNS)
    return row as WorkoutSession
  }

  async update(id: string, input: Partial<WorkoutSession>) {
    const [row] = await this.db('workout_sessions')
      .where({ id })
      .whereNull('deletedAt')
      .update({ ...input, updatedAt: this.db.fn.now() })
      .returning(COLUMNS)
    return row as WorkoutSession | undefined
  }

  softDelete(id: string) {
    return this.db('workout_sessions')
      .where({ id })
      .whereNull('deletedAt')
      .update({ deletedAt: this.db.fn.now() })
  }
}
