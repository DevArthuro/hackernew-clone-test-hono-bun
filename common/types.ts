import { insertpostSchema } from "@/db/schemas/posts";
import { z } from "zod";

export type SuccessResponse<T = void> = {
  success: boolean;
  message: string;
} & (T extends void ? {} : { data: T });

export type ErrorResponse = {
  success: boolean;
  error: string;
  isFormError?: boolean;
};

export const loginSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(31)
    .regex(/^[a-zA-Z0-9_]+$/),
  password: z.string().min(3).max(255),
});

export const createPostSchema = insertpostSchema.pick();
