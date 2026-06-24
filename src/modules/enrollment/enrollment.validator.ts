import { z } from "zod";

export const enrollSchema = z.object({
  params: z.object({
    slug: z
      .string({ error: "slug الزامی است" })
      .min(1, "slug نامعتبر است")
      .max(200),
  }),
});

export const listMyCoursesSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/, "page باید عدد باشد").optional(),
    limit: z.string().regex(/^\d+$/, "limit باید عدد باشد").optional(),
  }),
});

export type ListMyCoursesQuery = z.infer<typeof listMyCoursesSchema>["query"];
