import type { Knex } from 'knex'
import { db } from '../db/db'
import { AuthModel } from './auth'
import { CheckinModel } from './checkin'
import { UserModel } from './user'
import { WorkoutModel } from './workout'
import { WorkoutScheduleModel } from './workout-schedule'
import { WorkoutSessionModel } from './workout-session'

export const authModel = new AuthModel(db)

export const transaction = <T>(
  work: (trx: Knex.Transaction) => Promise<T>
): Promise<T> => db.transaction(work)

export const buildModels = (trx: Knex.Transaction) => ({
  users: new UserModel(trx),
  workouts: new WorkoutModel(trx),
  workoutSchedule: new WorkoutScheduleModel(trx),
  workoutSessions: new WorkoutSessionModel(trx),
  checkins: new CheckinModel(trx),
})

export type Models = ReturnType<typeof buildModels>
