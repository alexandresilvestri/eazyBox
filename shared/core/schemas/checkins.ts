import { z } from "zod";

export const createCheckinSchema = z.object({
  workoutSessionId: z.uuid(),
});

export type CreateCheckinInput = z.infer<typeof createCheckinSchema>;
