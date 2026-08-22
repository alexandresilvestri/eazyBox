import { authModel } from '../models'
import type { Models } from '../models'
import { AuthService } from './auth'
import { UsersService } from './users'

export const authService = new AuthService(authModel)

export const buildServices = (models: Models) => ({
  users: new UsersService(models.users),
})

export type Services = ReturnType<typeof buildServices>
