import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    email: z.string().email("ایمیل وارد شده معتبر نیست"),
    password: z.string().min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد"),
    name: z.string().optional(),
  }),
});

export const verifyEmailSchema = z.object({
  body: z.object({
    email: z.string().email("ایمیل وارد شده معتبر نیست"),
    code: z.string().length(6, "کد تایید باید ۶ رقمی باشد"),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("ایمیل وارد شده معتبر نیست"),
    password: z.string().min(1, "رمز عبور نمی‌تواند خالی باشد"),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>["body"];
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>["body"];
export type LoginInput = z.infer<typeof loginSchema>["body"];
