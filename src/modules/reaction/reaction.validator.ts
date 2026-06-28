import { z } from "zod";

export const toggleReactionSchema = z.object({
  params: z.object({
    id: z.string().uuid("شناسه نامعتبر است"),
  }),
  body: z.object({
    type: z.enum(["LIKE", "DISLIKE"], {
      error: "type باید LIKE یا DISLIKE باشد",
    }),
  }),
});

export type ToggleReactionBody = z.infer<typeof toggleReactionSchema>["body"];
