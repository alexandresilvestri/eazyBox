import type { Knex } from 'knex'
import { db } from '../db/db'
import { UserModel } from './user'

export const transaction = <T>(
  work: (trx: Knex.Transaction) => Promise<T>
): Promise<T> => db.transaction(work)

export const buildModels = (trx: Knex.Transaction) => ({
  users: new UserModel(trx),
})

export type Models = ReturnType<typeof buildModels>
