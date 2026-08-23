import type { Knex } from 'knex'
import type { Workout } from '@eazybox/shared'

const COLUMNS: (keyof Workout)[] = [
  'id',
  'warmUp',
  'skill',
  'wod',
  'createdAt',
  'updatedAt',
]

export class WorkoutModel {
  constructor(private readonly db: Knex) {}

  findAll() {
    return this.db<Workout>('workouts')
      .select(COLUMNS)
      .whereNull('deletedAt')
      .orderBy('createdAt', 'desc')
  }

  findById(id: string) {
    return this.db<Workout>('workouts')
      .select(COLUMNS)
      .where({ id })
      .whereNull('deletedAt')
      .first()
  }

  async insert(input: Partial<Workout>) {
    const [row] = await this.db('workouts').insert(input).returning(COLUMNS)
    return row as Workout
  }

  async update(id: string, input: Partial<Workout>) {
    const [row] = await this.db('workouts')
      .where({ id })
      .whereNull('deletedAt')
      .update({ ...input, updatedAt: this.db.fn.now() })
      .returning(COLUMNS)
    return row as Workout | undefined
  }

  softDelete(id: string) {
    return this.db('workouts')
      .where({ id })
      .whereNull('deletedAt')
      .update({ deletedAt: this.db.fn.now() })
  }
}
