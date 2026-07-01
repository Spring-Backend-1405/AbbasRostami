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

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email("ایمیل وارد شده معتبر نیست"),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    email: z.string().email("ایمیل وارد شده معتبر نیست"),
    code: z.string().length(6, "کد تایید باید ۶ رقمی باشد"),
    newPassword: z.string().min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد"),
  }),
});

export const resendVerificationSchema = z.object({
  body: z.object({
    email: z.string().email("ایمیل وارد شده معتبر نیست"),
  }),
});

export const resendResetCodeSchema = z.object({
  body: z.object({
    email: z.string().email("ایمیل وارد شده معتبر نیست"),
  }),
});

export const changePasswordSchema = z
  .object({
    body: z.object({
      currentPassword: z
        .string({ error: "رمز عبور فعلی الزامی است" })
        .min(1, "رمز عبور فعلی نمی‌تواند خالی باشد"),
      newPassword: z
        .string({ error: "رمز عبور جدید الزامی است" })
        .min(6, "رمز عبور جدید باید حداقل ۶ کاراکتر باشد"),
    }),
  })
  .refine((data) => data.body.currentPassword !== data.body.newPassword, {
    message: "رمز عبور جدید نباید با رمز فعلی یکسان باشد",
    path: ["body", "newPassword"],
  });

export const requestChangeEmailSchema = z.object({
  body: z.object({
    newEmail: z
      .string({ error: "ایمیل جدید الزامی است" })
      .email("ایمیل وارد شده معتبر نیست"),
    password: z
      .string({ error: "رمز عبور الزامی است" })
      .min(1, "رمز عبور نمی‌تواند خالی باشد"),
  }),
});

export const verifyChangeEmailSchema = z.object({
  body: z.object({
    code: z.string({ error: "کد الزامی است" }).length(6, "کد باید ۶ رقمی باشد"),
  }),
});

export type RequestChangeEmailInput = z.infer<
  typeof requestChangeEmailSchema
>["body"];
export type VerifyChangeEmailInput = z.infer<
  typeof verifyChangeEmailSchema
>["body"];

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>["body"];

export type ResendVerificationInput = z.infer<
  typeof resendVerificationSchema
>["body"];

export type ResendResetCodeInput = z.infer<
  typeof resendResetCodeSchema
>["body"];

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>["body"];
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>["body"];

export type RegisterInput = z.infer<typeof registerSchema>["body"];
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>["body"];
export type LoginInput = z.infer<typeof loginSchema>["body"];
