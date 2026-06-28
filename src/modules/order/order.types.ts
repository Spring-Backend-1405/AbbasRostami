import { Prisma } from "../../../generated/prisma/client.js";

export const orderDetailInclude = {
  items: {
    select: {
      id: true,
      courseId: true,
      courseTitle: true,
      courseSlug: true,
      courseImageUrl: true,
      price: true,
      createdAt: true,
    },
  },
} satisfies Prisma.OrderInclude;

export const orderListInclude = {
  items: {
    select: {
      id: true,
      courseTitle: true,
      price: true,
    },
  },
} satisfies Prisma.OrderInclude;

export const orderAdminInclude = {
  user: {
    select: {
      id: true,
      email: true,
      name: true,
    },
  },
  items: {
    select: {
      id: true,
      courseId: true,
      courseTitle: true,
      courseSlug: true,
      courseImageUrl: true,
      price: true,
      createdAt: true,
    },
  },
} satisfies Prisma.OrderInclude;

export type OrderAdminItem = Prisma.OrderGetPayload<{
  include: typeof orderAdminInclude;
}>;

export type OrderWithItems = Prisma.OrderGetPayload<{
  include: typeof orderDetailInclude;
}>;

export type OrderListItem = Prisma.OrderGetPayload<{
  include: typeof orderListInclude;
}>;
