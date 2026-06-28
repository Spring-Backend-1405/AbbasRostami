import { Prisma } from "../../../generated/prisma/client.js";

export const courseFavoriteInclude = {
  course: {
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      _count: {
        select: {
          enrollments: true,
          comments: true,
        },
      },
    },
  },
} satisfies Prisma.CourseFavoriteInclude;

export const postFavoriteInclude = {
  post: {
    include: {
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
    },
  },
} satisfies Prisma.BlogFavoriteInclude;

export type CourseFavoriteWithRelations = Prisma.CourseFavoriteGetPayload<{
  include: typeof courseFavoriteInclude;
}>;

export type PostFavoriteWithRelations = Prisma.BlogFavoriteGetPayload<{
  include: typeof postFavoriteInclude;
}>;
