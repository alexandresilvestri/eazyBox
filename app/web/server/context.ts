import type { Services } from './services'

export type AuthContext = {
  userId: string
  isAdmin: boolean
  isCoach: boolean
}

export type Transport = 'cookie' | 'token'

export type AppEnv = {
  Variables: {
    auth: AuthContext
    services: Services
    transport: Transport
  }
}
