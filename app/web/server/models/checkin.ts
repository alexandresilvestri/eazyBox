import type { Knex } from 'knex'
import type { Checkin } from '@eazybox/shared'

const COLUMNS: (keyof Checkin)[] = [
  'id',
  'userId',
  'workoutSessionId',
  'undone',
  'createdAt',
]

export class CheckinModel {
  constructor(private readonly db: Knex) {}

  findAll() {
    return this.db<Checkin>('checkins')
      .select(COLUMNS)
      .orderBy('createdAt', 'desc')
  }

  findById(id: string) {
    return this.db<Checkin>('checkins').select(COLUMNS).where({ id }).first()
  }

  async insert(input: Pick<Checkin, 'userId' | 'workoutSessionId'>) {
    const [row] = await this.db('checkins').insert(input).returning(COLUMNS)
    return row as Checkin
  }

  async setUndone(id: string, undone: boolean) {
    const [row] = await this.db('checkins')
      .where({ id })
      .update({ undone })
      .returning(COLUMNS)
    return row as Checkin | undefined
  }
}
