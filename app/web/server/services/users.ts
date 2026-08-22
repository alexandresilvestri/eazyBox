import { EmailAlreadyTaken, UserNotFound } from '../errors'
import type { UserModel } from '../models/user'
import type { CreateUserInput, UpdateUserInput } from '@eazybox/shared'

const UNIQUE_VIOLATION = '23505'

export class UsersService {
  constructor(private readonly users: UserModel) {}

  list() {
    return this.users.findAll()
  }

  async findById(id: string) {
    const user = await this.users.findById(id)
    if (!user) {
      throw new UserNotFound()
    }
    return user
  }

  async create(input: CreateUserInput) {
    try {
      return await this.users.insert({
        ...input,
        password: await Bun.password.hash(input.password),
      })
    } catch (err) {
      if ((err as { code?: string } | null)?.code === UNIQUE_VIOLATION) {
        throw new EmailAlreadyTaken()
      }
      throw err
    }
  }

  async update(id: string, input: UpdateUserInput) {
    const user = await this.users.update(id, input)
    if (!user) {
      throw new UserNotFound()
    }
    return user
  }

  async remove(id: string) {
    const deleted = await this.users.softDelete(id)
    if (!deleted) {
      throw new UserNotFound()
    }
  }
}
