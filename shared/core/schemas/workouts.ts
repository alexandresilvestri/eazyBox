import { z } from "zod";

export const createWorkoutSchema = z.object({
  warmUp: z.string().trim().min(1).nullish(),
  skill: z.string().trim().min(1).nullish(),
  wod: z.string().trim().min(1),
});

export const updateWorkoutSchema = createWorkoutSchema.partial();

export type CreateWorkoutInput = z.infer<typeof createWorkoutSchema>;
export type UpdateWorkoutInput = z.infer<typeof updateWorkoutSchema>;
