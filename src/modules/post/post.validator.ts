import { z } from "zod";

export const createPostSchema = z.object({
  body: z.object({
    title: z
      .string({ error: "عنوان الزامی است" })
      .min(3, "عنوان باید حداقل ۳ کاراکتر باشد")
      .max(200, "عنوان نمی‌تواند بیشتر از ۲۰۰ کاراکتر باشد")
      .trim(),
    content: z
      .string({ error: "محتوا الزامی است" })
      .min(10, "محتوا باید حداقل ۱۰ کاراکتر باشد")
      .trim(),
    categoryId: z.string().uuid("شناسه دسته‌بندی نامعتبر است").optional(),
    published: z
      .union([z.boolean(), z.enum(["true", "false"])], {
        message: "مقدار published باید true یا false باشد",
      })
      .transform((val) => val === true || val === "true")
      .optional()
      .default(false),
  }),
});

export const updatePostSchema = z.object({
  params: z.object({
    id: z.string().uuid("شناسه نامعتبر است"),
  }),
  body: z
    .object({
      title: z
        .string()
        .min(3, "عنوان باید حداقل ۳ کاراکتر باشد")
        .max(200, "عنوان نمی‌تواند بیشتر از ۲۰۰ کاراکتر باشد")
        .trim()
        .optional(),
      content: z
        .string()
        .min(10, "محتوا باید حداقل ۱۰ کاراکتر باشد")
        .trim()
        .optional(),
      categoryId: z
        .string()
        .uuid("شناسه دسته‌بندی نامعتبر است")
        .nullable()
        .optional(),
      published: z
        .union([z.boolean(), z.enum(["true", "false"])], {
          message: "مقدار published باید true یا false باشد",
        })
        .transform((val) => val === true || val === "true")
        .optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "حداقل یک فیلد برای ویرایش الزامی است",
    }),
});

export const deletePostSchema = z.object({
  params: z.object({
    id: z.string().uuid("شناسه نامعتبر است"),
  }),
});

export const togglePublishPostSchema = z.object({
  params: z.object({
    id: z.string().uuid("شناسه نامعتبر است"),
  }),
  body: z.object({
    published: z
      .union([z.boolean(), z.enum(["true", "false"])])
      .transform((val) => val === true || val === "true"),
  }),
});

export const listPostsPublicSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/, "page باید عدد باشد").optional(),
    limit: z.string().regex(/^\d+$/, "limit باید عدد باشد").optional(),
    category: z.string().optional(),
    search: z.string().trim().max(100).optional(),
    sortBy: z.enum(["createdAt", "title"]).optional(),
    order: z.enum(["asc", "desc"]).optional(),
  }),
});

export const listPostsAdminSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/, "page باید عدد باشد").optional(),
    limit: z.string().regex(/^\d+$/, "limit باید عدد باشد").optional(),
    published: z.enum(["true", "false"]).optional(),
    search: z.string().trim().max(100).optional(),
    sortBy: z.enum(["createdAt", "title"]).optional(),
    order: z.enum(["asc", "desc"]).optional(),
  }),
});

export const getPostBySlugSchema = z.object({
  params: z.object({
    slug: z.string().min(1).max(200),
  }),
});

export type CreatePostInput = z.infer<typeof createPostSchema>["body"];
export type UpdatePostInput = z.infer<typeof updatePostSchema>["body"];
export type ListPostsPublicQuery = z.infer<
  typeof listPostsPublicSchema
>["query"];
export type ListPostsAdminQuery = z.infer<typeof listPostsAdminSchema>["query"];
