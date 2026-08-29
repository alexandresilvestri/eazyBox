import { z } from "zod";

import { WEEK_DAYS } from "../types";

export const weekDaySchema = z.enum(WEEK_DAYS);

export const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/)
  .transform((value) => value.slice(0, 5));

export const createWorkoutScheduleSchema = z.object({
  weekDay: weekDaySchema,
  time: timeSchema,
  capacity: z.int().positive().optional(),
  coachId: z.uuid().nullish(),
});

export const updateWorkoutScheduleSchema =
  createWorkoutScheduleSchema.partial();

export type CreateWorkoutScheduleInput = z.infer<
  typeof createWorkoutScheduleSchema
>;
export type UpdateWorkoutScheduleInput = z.infer<
  typeof updateWorkoutScheduleSchema
>;
