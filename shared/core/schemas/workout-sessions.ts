import { z } from "zod";

export const createWorkoutSessionSchema = z.object({
  workoutScheduleId: z.uuid(),
  workoutId: z.uuid(),
  sessionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  capacity: z.int().positive().optional(),
  coachId: z.uuid().nullish(),
});

export const updateWorkoutSessionSchema = createWorkoutSessionSchema
  .pick({ workoutId: true, capacity: true, coachId: true })
  .partial();

export type CreateWorkoutSessionInput = z.infer<
  typeof createWorkoutSessionSchema
>;
export type UpdateWorkoutSessionInput = z.infer<
  typeof updateWorkoutSessionSchema
>;

export const addAttendeeSchema = z.object({
  userId: z.uuid(),
});

export type AddAttendeeInput = z.infer<typeof addAttendeeSchema>;
