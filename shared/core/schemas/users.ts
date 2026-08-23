import { z } from "zod";

export const createUserSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
});

export const updateUserSchema = createUserSchema
  .pick({ email: true, firstName: true, lastName: true })
  .partial();

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
