import type { Models } from '../models'
import { UsersService } from './users'

export const buildServices = (models: Models) => ({
  users: new UsersService(models.users),
})

export type Services = ReturnType<typeof buildServices>
