import { Prisma } from "../../../generated/prisma/client.js";
import { CreateCourseInput, UpdateCourseInput } from "./course.validator.js";

export type CreateCourseInputWithImage = CreateCourseInput & {
  imageUrl?: string;
};

export type UpdateCourseInputWithImage = UpdateCourseInput & {
  imageUrl?: string;
};

export const courseWithCount = {
  _count: {
    select: {
      enrollments: true,
      comments: true,
    },
  },
} satisfies Prisma.CourseInclude;

export const courseWithCategory = {
  category: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
} satisfies Prisma.CourseInclude;

export const courseInclude = {
  category: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
  teacher: {
    select: {
      id: true,
      name: true,
      slug: true,
      avatar: true,
    },
  },
  _count: {
    select: {
      enrollments: true,
      comments: true,
    },
  },
} satisfies Prisma.CourseInclude;

export type CourseWithRelations = Prisma.CourseGetPayload<{
  include: typeof courseInclude;
}>;

export type CourseWithStats = Omit<
  CourseWithRelations,
  "_count" | "categoryId" | "teacherId"
> & {
  stats: {
    enrollments: number;
    comments: number;
  };
};
