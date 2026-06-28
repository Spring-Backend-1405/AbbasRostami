import { Prisma } from "../../../generated/prisma/client.js";
import { CreatePostInput, UpdatePostInput } from "./post.validator.js";

export type CreatePostInputWithImage = CreatePostInput & {
  imageUrl?: string;
};

export type UpdatePostInputWithImage = UpdatePostInput & {
  imageUrl?: string;
};

export const postInclude = {
  category: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
  _count: {
    select: {
      comments: true,
    },
  },
} satisfies Prisma.PostInclude;

export type PostWithRelations = Prisma.PostGetPayload<{
  include: typeof postInclude;
}>;

export type PostWithStats = Omit<PostWithRelations, "_count" | "categoryId"> & {
  stats: {
    comments: number;
  };
};
