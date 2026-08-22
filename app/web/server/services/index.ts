import { authModel } from '../models'
import type { Models } from '../models'
import { AuthService } from './auth'
import { CheckinsService } from './checkins'
import { UsersService } from './users'
import { WorkoutScheduleService } from './workout-schedule'
import { WorkoutSessionsService } from './workout-sessions'
import { WorkoutsService } from './workouts'

export const authService = new AuthService(authModel)

export const buildServices = (models: Models) => ({
  users: new UsersService(models.users),
  workouts: new WorkoutsService(models.workouts),
  workoutSchedule: new WorkoutScheduleService(models.workoutSchedule),
  workoutSessions: new WorkoutSessionsService(
    models.workoutSessions,
    models.workoutSchedule,
    models.workouts
  ),
  checkins: new CheckinsService(models.checkins, models.workoutSessions),
})

export type Services = ReturnType<typeof buildServices>
