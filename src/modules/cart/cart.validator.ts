import { z } from "zod";

export const addToCartSchema = z.object({
  body: z.object({
    courseId: z.string().uuid("شناسه دوره نامعتبر است"),
  }),
});

export const removeFromCartSchema = z.object({
  params: z.object({
    courseId: z.string().uuid("شناسه دوره نامعتبر است"),
  }),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>["body"];
