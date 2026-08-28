export class EmailAlreadyTaken extends Error {
  override name = 'EmailAlreadyTaken'
}

export class UserNotFound extends Error {
  override name = 'UserNotFound'
}

export class InvalidCredentials extends Error {
  override name = 'InvalidCredentials'
}

export class InactiveUser extends Error {
  override name = 'InactiveUser'
}

export class AlreadyCheckedIn extends Error {
  override name = 'AlreadyCheckedIn'
}

export class InvalidRefreshToken extends Error {
  override name = 'InvalidRefreshToken'
}

export class WorkoutNotFound extends Error {
  override name = 'WorkoutNotFound'
}

export class WorkoutScheduleNotFound extends Error {
  override name = 'WorkoutScheduleNotFound'
}

export class WorkoutSessionNotFound extends Error {
  override name = 'WorkoutSessionNotFound'
}

export class CheckinNotFound extends Error {
  override name = 'CheckinNotFound'
}

export class ScheduleSlotTaken extends Error {
  override name = 'ScheduleSlotTaken'
}

export class SessionAlreadyScheduled extends Error {
  override name = 'SessionAlreadyScheduled'
}

export class AnnouncementNotFound extends Error {
  override name = 'AnnouncementNotFound'
}

export class FlagChangeForbidden extends Error {
  override name = 'FlagChangeForbidden'
}
