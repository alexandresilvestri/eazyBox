import { z } from "zod";

export const createWorkoutSessionSchema = z.object({
  workoutScheduleId: z.uuid(),
  workoutId: z.uuid(),
  sessionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const updateWorkoutSessionSchema = z.object({
  workoutId: z.uuid().optional(),
});

export type CreateWorkoutSessionInput = z.infer<
  typeof createWorkoutSessionSchema
>;
export type UpdateWorkoutSessionInput = z.infer<
  typeof updateWorkoutSessionSchema
>;
