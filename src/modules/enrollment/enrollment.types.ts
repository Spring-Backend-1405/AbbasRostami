import { Prisma } from "../../../generated/prisma/client.js";

export const enrollmentInclude = {
  course: {
    include: {
      category: {
        select: { id: true, name: true, slug: true },
      },
      teacher: {
        select: { id: true, name: true, slug: true, avatar: true },
      },
      _count: {
        select: {
          enrollments: true,
          comments: true,
        },
      },
    },
  },
} satisfies Prisma.EnrollmentInclude;

export type EnrollmentWithRelations = Prisma.EnrollmentGetPayload<{
  include: typeof enrollmentInclude;
}>;
