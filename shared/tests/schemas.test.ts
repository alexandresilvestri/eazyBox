import { describe, expect, test } from "bun:test";
import {
  addAttendeeSchema,
  changePasswordSchema,
  createAnnouncementSchema,
  createCheckinSchema,
  createUserSchema,
  createWorkoutScheduleSchema,
  createWorkoutSessionSchema,
  createWorkoutSchema,
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  timeSchema,
  updateUserSchema,
  weekDaySchema,
} from "../index";

const UUID = "00000000-0000-0000-0000-000000000000";

const validUser = {
  email: "ana@eazybox.test",
  password: "password123",
  firstName: "Ana",
  lastName: "Silva",
};

describe("timeSchema", () => {
  test("accepts HH:MM", () => {
    expect(timeSchema.safeParse("06:00").success).toBe(true);
    expect(timeSchema.safeParse("23:59").success).toBe(true);
    expect(timeSchema.safeParse("00:00").success).toBe(true);
  });

  test("rejects an out of range hour or minute", () => {
    expect(timeSchema.safeParse("24:00").success).toBe(false);
    expect(timeSchema.safeParse("06:60").success).toBe(false);
    expect(timeSchema.safeParse("6:00").success).toBe(false);
  });

  test("accepts the HH:MM:SS that Postgres returns and normalises it", () => {
    const parsed = timeSchema.safeParse("06:00:00");
    expect(parsed.success).toBe(true);
    expect(parsed.data).toBe("06:00");
  });

  test("rejects seconds that are out of range", () => {
    expect(timeSchema.safeParse("06:00:60").success).toBe(false);
  });

  test("rejects a time with more than seconds precision", () => {
    expect(timeSchema.safeParse("06:00:00.000").success).toBe(false);
  });
});

describe("weekDaySchema", () => {
  test("accepts a known week day", () => {
    expect(weekDaySchema.safeParse("monday").success).toBe(true);
  });

  test("rejects an unknown day and a capitalised one", () => {
    expect(weekDaySchema.safeParse("funday").success).toBe(false);
    expect(weekDaySchema.safeParse("Monday").success).toBe(false);
  });
});

describe("createUserSchema", () => {
  test("accepts a complete user", () => {
    expect(createUserSchema.safeParse(validUser).success).toBe(true);
  });

  test("rejects a malformed email", () => {
    expect(
      createUserSchema.safeParse({ ...validUser, email: "not-an-email" })
        .success,
    ).toBe(false);
  });

  test("rejects a password shorter than 8 characters", () => {
    expect(
      createUserSchema.safeParse({ ...validUser, password: "short" }).success,
    ).toBe(false);
  });

  test("rejects a blank or whitespace-only name", () => {
    expect(
      createUserSchema.safeParse({ ...validUser, firstName: "" }).success,
    ).toBe(false);
    expect(
      createUserSchema.safeParse({ ...validUser, firstName: "   " }).success,
    ).toBe(false);
  });

  test("trims names", () => {
    const parsed = createUserSchema.parse({ ...validUser, firstName: "  Ana  " });
    expect(parsed.firstName).toBe("Ana");
  });
});

describe("updateUserSchema", () => {
  test("accepts an empty patch", () => {
    expect(updateUserSchema.safeParse({}).success).toBe(true);
  });

  test("accepts the role and status flags", () => {
    expect(
      updateUserSchema.safeParse({ isCoach: true, isActive: false }).success,
    ).toBe(true);
  });

  test("does not accept a password", () => {
    const parsed = updateUserSchema.parse({ password: "password123" } as never);
    expect(parsed).not.toHaveProperty("password");
  });
});

describe("auth schemas", () => {
  test("loginSchema requires an email and a password", () => {
    expect(
      loginSchema.safeParse({ email: "ana@eazybox.test", password: "x" })
        .success,
    ).toBe(true);
    expect(loginSchema.safeParse({ email: "ana@eazybox.test" }).success).toBe(
      false,
    );
  });

  test("forgotPasswordSchema requires a valid email", () => {
    expect(
      forgotPasswordSchema.safeParse({ email: "ana@eazybox.test" }).success,
    ).toBe(true);
    expect(forgotPasswordSchema.safeParse({ email: "nope" }).success).toBe(
      false,
    );
  });

  test("resetPasswordSchema enforces the shared password rule", () => {
    expect(
      resetPasswordSchema.safeParse({ token: "t", password: "password123" })
        .success,
    ).toBe(true);
    expect(
      resetPasswordSchema.safeParse({ token: "t", password: "short" }).success,
    ).toBe(false);
  });

  test("changePasswordSchema enforces the shared password rule", () => {
    expect(
      changePasswordSchema.safeParse({
        currentPassword: "whatever",
        password: "password123",
      }).success,
    ).toBe(true);
    expect(
      changePasswordSchema.safeParse({
        currentPassword: "whatever",
        password: "short",
      }).success,
    ).toBe(false);
  });
});

describe("workout schemas", () => {
  test("createWorkoutSchema requires a wod", () => {
    expect(createWorkoutSchema.safeParse({ wod: "Fran" }).success).toBe(true);
    expect(createWorkoutSchema.safeParse({}).success).toBe(false);
    expect(createWorkoutSchema.safeParse({ wod: "" }).success).toBe(false);
  });
});

describe("workout schedule schemas", () => {
  test("accepts a valid slot", () => {
    expect(
      createWorkoutScheduleSchema.safeParse({
        weekDay: "monday",
        time: "06:00",
      }).success,
    ).toBe(true);
  });

  test("accepts a slot whose time came back from Postgres", () => {
    const parsed = createWorkoutScheduleSchema.safeParse({
      weekDay: "monday",
      time: "06:00:00",
    });
    expect(parsed.success).toBe(true);
    expect(parsed.data?.time).toBe("06:00");
  });
});

describe("workout session schemas", () => {
  test("accepts a YYYY-MM-DD session date", () => {
    expect(
      createWorkoutSessionSchema.safeParse({
        workoutScheduleId: UUID,
        workoutId: UUID,
        sessionDate: "2026-08-24",
      }).success,
    ).toBe(true);
  });

  test("rejects a full ISO timestamp as the session date", () => {
    expect(
      createWorkoutSessionSchema.safeParse({
        workoutScheduleId: UUID,
        workoutId: UUID,
        sessionDate: "2026-08-24T00:00:00.000Z",
      }).success,
    ).toBe(false);
  });

  test("rejects a non-uuid id", () => {
    expect(
      createWorkoutSessionSchema.safeParse({
        workoutScheduleId: "nope",
        workoutId: UUID,
        sessionDate: "2026-08-24",
      }).success,
    ).toBe(false);
  });

  test("addAttendeeSchema requires a uuid user id", () => {
    expect(addAttendeeSchema.safeParse({ userId: UUID }).success).toBe(true);
    expect(addAttendeeSchema.safeParse({ userId: "nope" }).success).toBe(false);
  });
});

describe("checkin and announcement schemas", () => {
  test("createCheckinSchema requires a uuid session id", () => {
    expect(
      createCheckinSchema.safeParse({ workoutSessionId: UUID }).success,
    ).toBe(true);
    expect(
      createCheckinSchema.safeParse({ workoutSessionId: "nope" }).success,
    ).toBe(false);
  });

  test("createAnnouncementSchema requires a non-empty body", () => {
    expect(createAnnouncementSchema.safeParse({ body: "Aviso" }).success).toBe(
      true,
    );
    expect(createAnnouncementSchema.safeParse({ body: "" }).success).toBe(false);
  });
});
