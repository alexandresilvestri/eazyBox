import type { Knex } from 'knex'

export type LoginRow = {
  id: string
  password: string
  isAdmin: boolean
  isCoach: boolean
  isActive: boolean
}

export type IdentityRow = Omit<LoginRow, 'password'>

const LOGIN_QUERY = `
  select id, password, is_admin as "isAdmin", is_coach as "isCoach",
         is_active as "isActive"
  from app.find_login(?)
`

const IDENTITY_QUERY = `
  select id, is_admin as "isAdmin", is_coach as "isCoach",
         is_active as "isActive"
  from app.find_identity(?)
`

export class AuthModel {
  constructor(private readonly db: Knex) {}

  async findLogin(email: string) {
    const result = await this.db.raw(LOGIN_QUERY, [email])
    return result.rows[0] as LoginRow | undefined
  }

  async findIdentity(id: string) {
    const result = await this.db.raw(IDENTITY_QUERY, [id])
    return result.rows[0] as IdentityRow | undefined
  }
}
