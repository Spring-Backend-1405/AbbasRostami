import { z } from "zod";

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2, "نام باید حداقل ۲ کاراکتر باشد").optional(),
    phone: z
      .string()
      .regex(/^09\d{9}$/, "شماره موبایل وارد شده معتبر نیست")
      .optional(),
  }),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>["body"];
