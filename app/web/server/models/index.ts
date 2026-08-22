import type { Knex } from 'knex'
import { db } from '../db/db'
import { AuthModel } from './auth'
import { UserModel } from './user'

export const authModel = new AuthModel(db)

export const transaction = <T>(
  work: (trx: Knex.Transaction) => Promise<T>
): Promise<T> => db.transaction(work)

export const buildModels = (trx: Knex.Transaction) => ({
  users: new UserModel(trx),
})

export type Models = ReturnType<typeof buildModels>
