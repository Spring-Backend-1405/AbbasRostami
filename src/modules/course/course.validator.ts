import { z } from "zod";

const courseLevelEnum = z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"], {
  error:
    "سطح دوره باید یکی از موارد زیر باشد: BEGINNER, INTERMEDIATE, ADVANCED",
});

const coerceNumber = z.coerce
  .number({ error: "قیمت باید عدد باشد" })
  .int("قیمت باید عدد صحیح باشد")
  .min(0, "قیمت نمی‌تواند منفی باشد")
  .max(1000000000, "قیمت بیش از حد بزرگ است");

const coerceBoolean = z.preprocess(
  (val) => {
    if (val === "true" || val === true) return true;
    if (val === "false" || val === false) return false;
    return val;
  },
  z.boolean({ error: "وضعیت انتشار باید boolean باشد" }),
);

const categoriesSchema = z
  .union([z.string(), z.array(z.string())])
  .optional()
  .transform((val) => {
    if (!val) return undefined;
    return Array.isArray(val) ? val : [val];
  });

export const createCourseSchema = z.object({
  body: z.object({
    title: z
      .string({ error: "عنوان دوره الزامی است" })
      .min(3, "عنوان دوره باید حداقل ۳ کاراکتر باشد")
      .max(150, "عنوان دوره نباید بیشتر از ۱۵۰ کاراکتر باشد")
      .trim(),
    description: z
      .string()
      .max(5000, "توضیحات نباید بیشتر از ۵۰۰۰ کاراکتر باشد")
      .trim()
      .optional(),
    price: coerceNumber,
    level: courseLevelEnum.optional().default("BEGINNER"),
    categoryId: z.string().uuid("شناسه دسته‌بندی نامعتبر است").optional(),
    published: coerceBoolean.optional().default(false),
  }),
});

export const updateCourseSchema = z.object({
  params: z.object({
    id: z.string().uuid("شناسه نامعتبر است"),
  }),
  body: z
    .object({
      title: z
        .string()
        .min(3, "عنوان دوره باید حداقل ۳ کاراکتر باشد")
        .max(150, "عنوان دوره نباید بیشتر از ۱۵۰ کاراکتر باشد")
        .trim()
        .optional(),
      description: z
        .string()
        .max(5000, "توضیحات نباید بیشتر از ۵۰۰۰ کاراکتر باشد")
        .trim()
        .optional(),
      price: coerceNumber.optional(),
      level: courseLevelEnum.optional(),
      categoryId: z
        .string()
        .uuid("شناسه دسته‌بندی نامعتبر است")
        .nullable()
        .optional(),
      published: coerceBoolean.optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "حداقل یک فیلد برای ویرایش الزامی است",
    }),
});

export const deleteCourseSchema = z.object({
  params: z.object({
    id: z.string().uuid("شناسه نامعتبر است"),
  }),
});

export const togglePublishSchema = z.object({
  params: z.object({
    id: z.string().uuid("شناسه نامعتبر است"),
  }),
  body: z.object({
    published: z.boolean({ error: "وضعیت انتشار باید boolean باشد" }),
  }),
});

export const getCourseBySlugSchema = z.object({
  params: z.object({
    slug: z.string().min(1, "slug الزامی است").max(200),
  }),
});

export const listCoursesPublicSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/, "page باید عدد باشد").optional(),
    limit: z.string().regex(/^\d+$/, "limit باید عدد باشد").optional(),
    categories: categoriesSchema,
    level: courseLevelEnum.optional(),
    minPrice: z.string().regex(/^\d+$/, "minPrice باید عدد باشد").optional(),
    maxPrice: z.string().regex(/^\d+$/, "maxPrice باید عدد باشد").optional(),
    search: z.string().max(100).optional(),
    sortBy: z.enum(["createdAt", "price", "title"]).optional(),
    order: z.enum(["asc", "desc"]).optional(),
  }),
});

export const listCoursesAdminSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/, "page باید عدد باشد").optional(),
    limit: z.string().regex(/^\d+$/, "limit باید عدد باشد").optional(),
    categories: categoriesSchema,
    level: courseLevelEnum.optional(),
    published: z.enum(["true", "false"]).optional(),
    search: z.string().max(100).optional(),
    sortBy: z.enum(["createdAt", "price", "title"]).optional(),
    order: z.enum(["asc", "desc"]).optional(),
  }),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>["body"];
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>["body"];
export type TogglePublishInput = z.infer<typeof togglePublishSchema>["body"];
export type ListCoursesPublicQuery = z.infer<
  typeof listCoursesPublicSchema
>["query"];
export type ListCoursesAdminQuery = z.infer<
  typeof listCoursesAdminSchema
>["query"];
