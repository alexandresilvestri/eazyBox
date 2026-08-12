import { z } from "zod";

export const createUserSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
});

// TODO(human): define which fields a PATCH /api/users/:id may change
export const updateUserSchema = z.object({});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

