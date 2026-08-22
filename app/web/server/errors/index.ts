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
