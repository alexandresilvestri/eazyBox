import type { Knex } from 'knex'
import type { User } from '@eazybox/shared'

type UserRow = User & { password: string }

const PUBLIC_COLUMNS: (keyof User)[] = [
  'id',
  'email',
  'firstName',
  'lastName',
  'isActive',
  'isAdmin',
  'isCoach',
  'createdAt',
  'updatedAt',
]

export class UserModel {
  constructor(private readonly db: Knex) {}

  findAll() {
    return this.db<UserRow>('users')
      .select(PUBLIC_COLUMNS)
      .whereNull('deletedAt')
      .orderBy('createdAt', 'asc')
  }

  findById(id: string) {
    return this.db<UserRow>('users')
      .select(PUBLIC_COLUMNS)
      .where({ id })
      .whereNull('deletedAt')
      .first()
  }

  async insert(input: Omit<UserRow, keyof User> & Partial<User>) {
    const [user] = await this.db('users')
      .insert(input)
      .returning(PUBLIC_COLUMNS)
    return user as User
  }

  async update(id: string, input: Partial<User>) {
    const [user] = await this.db('users')
      .where({ id })
      .whereNull('deletedAt')
      .update({ ...input, updatedAt: this.db.fn.now() })
      .returning(PUBLIC_COLUMNS)
    return user as User | undefined
  }

  softDelete(id: string) {
    return this.db('users')
      .where({ id })
      .whereNull('deletedAt')
      .update({ deletedAt: this.db.fn.now() })
  }
}
