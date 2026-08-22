import { z } from "zod";

export const weekDaySchema = z.enum([
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
]);

export const timeSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);

export const createWorkoutScheduleSchema = z.object({
  weekDay: weekDaySchema,
  time: timeSchema,
});

export const updateWorkoutScheduleSchema =
  createWorkoutScheduleSchema.partial();

export type CreateWorkoutScheduleInput = z.infer<
  typeof createWorkoutScheduleSchema
>;
export type UpdateWorkoutScheduleInput = z.infer<
  typeof updateWorkoutScheduleSchema
>;
