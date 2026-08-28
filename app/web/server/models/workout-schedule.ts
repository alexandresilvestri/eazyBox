import type { Knex } from 'knex'
import type { WorkoutSchedule } from '@eazybox/shared'

const COLUMNS: (keyof WorkoutSchedule)[] = [
  'id',
  'weekDay',
  'time',
  'capacity',
  'coachId',
  'createdAt',
  'updatedAt',
]

export class WorkoutScheduleModel {
  constructor(private readonly db: Knex) {}

  findAll() {
    return this.db<WorkoutSchedule>('workout_schedule')
      .select(COLUMNS)
      .whereNull('deletedAt')
      .orderBy(['weekDay', 'time'])
  }

  findById(id: string) {
    return this.db<WorkoutSchedule>('workout_schedule')
      .select(COLUMNS)
      .where({ id })
      .whereNull('deletedAt')
      .first()
  }

  async insert(input: Partial<WorkoutSchedule>) {
    const [row] = await this.db('workout_schedule')
      .insert(input)
      .returning(COLUMNS)
    return row as WorkoutSchedule
  }

  async update(id: string, input: Partial<WorkoutSchedule>) {
    const [row] = await this.db('workout_schedule')
      .where({ id })
      .whereNull('deletedAt')
      .update({ ...input, updatedAt: this.db.fn.now() })
      .returning(COLUMNS)
    return row as WorkoutSchedule | undefined
  }

  softDelete(id: string) {
    return this.db('workout_schedule')
      .where({ id })
      .whereNull('deletedAt')
      .update({ deletedAt: this.db.fn.now() })
  }
}
