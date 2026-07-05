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

export const listUsersSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
    search: z.string().max(100).optional(),
    role: z.enum(["USER", "ADMIN"]).optional(),
    isVerified: z.enum(["true", "false"]).optional(),
    sortBy: z.enum(["createdAt", "name", "email"]).optional(),
    order: z.enum(["asc", "desc"]).optional(),
  }),
});

export const getUserByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid("شناسه کاربر نامعتبر است"),
  }),
});

export type ListUsersQuery = z.infer<typeof listUsersSchema>["query"];
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>["body"];
