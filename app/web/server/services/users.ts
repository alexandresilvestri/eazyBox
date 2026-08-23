import { EmailAlreadyTaken, UserNotFound } from '../errors'
import type { UserModel } from '../models/user'
import { isUniqueViolation } from './constants'
import type { CreateUserInput, UpdateUserInput } from '@eazybox/shared'

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
      if (isUniqueViolation(err)) {
        throw new EmailAlreadyTaken()
      }
      throw err
    }
  }

  async update(id: string, input: UpdateUserInput) {
    let user
    try {
      user = await this.users.update(id, input)
    } catch (err) {
      if (isUniqueViolation(err)) {
        throw new EmailAlreadyTaken()
      }
      throw err
    }
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
