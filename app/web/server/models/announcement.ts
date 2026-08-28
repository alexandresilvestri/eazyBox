import type { Knex } from 'knex'
import type { Announcement } from '@eazybox/shared'

const COLUMNS: (keyof Announcement)[] = [
  'id',
  'body',
  'authorId',
  'createdAt',
  'updatedAt',
]

export class AnnouncementModel {
  constructor(private readonly db: Knex) {}

  findAll() {
    return this.db<Announcement>('announcements')
      .select(COLUMNS)
      .whereNull('deletedAt')
      .orderBy('createdAt', 'desc')
  }

  async insert(input: Partial<Announcement>) {
    const [row] = await this.db('announcements')
      .insert(input)
      .returning(COLUMNS)
    return row as Announcement
  }

  async update(id: string, input: Partial<Announcement>) {
    const [row] = await this.db('announcements')
      .where({ id })
      .whereNull('deletedAt')
      .update({ ...input, updatedAt: this.db.fn.now() })
      .returning(COLUMNS)
    return row as Announcement | undefined
  }

  softDelete(id: string) {
    return this.db('announcements')
      .where({ id })
      .whereNull('deletedAt')
      .update({ deletedAt: this.db.fn.now() })
  }
}
