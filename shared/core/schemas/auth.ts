import { z } from "zod";
import { createUserSchema } from "./users";

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: createUserSchema.shape.password,
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  password: createUserSchema.shape.password,
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshInput = z.infer<typeof refreshSchema>;
