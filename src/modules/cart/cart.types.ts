import { Prisma } from "../../../generated/prisma/client.js";

export const cartInclude = {
  items: {
    include: {
      course: {
        select: {
          id: true,
          title: true,
          slug: true,
          imageUrl: true,
          price: true,
          level: true,
          published: true,
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
              show: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  },
} satisfies Prisma.CartInclude;

export type CartWithItems = Prisma.CartGetPayload<{
  include: typeof cartInclude;
}>;
