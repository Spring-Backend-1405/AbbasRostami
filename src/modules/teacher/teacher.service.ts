import { Prisma } from "../../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { removeCloudinaryImage } from "../../utils/cloudinary.js";
import {
  buildPaginationMeta,
  parsePagination,
} from "../../utils/pagination.js";
import { createSlug } from "../../utils/slug.js";
import {
  CreateTeacherInput,
  ListTeachersQuery,
  UpdateTeacherInput,
} from "./teacher.validator.js";

const teacherSelect = {
  id: true,
  name: true,
  slug: true,
  bio: true,
  avatar: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.TeacherSelect;

export const teacherService = {
  async createTeacher(data: CreateTeacherInput & { avatar?: string }) {
    try {
      const teacher = await prisma.teacher.create({
        data: {
          name: data.name,
          slug: createSlug(data.name),
          bio: data.bio,
          avatar: data.avatar,
        },
        select: teacherSelect,
      });

      return teacher;
    } catch (error) {
      if (data.avatar) {
        await removeCloudinaryImage(data.avatar);
      }

      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new AppError("مدرسی با این نام قبلاً ثبت شده است", 400, {
          name: "این نام قبلاً استفاده شده است",
        });
      }

      throw error;
    }
  },

  async updateTeacher(
    id: string,
    data: UpdateTeacherInput & { avatar?: string },
  ) {
    if (Object.keys(data).length === 0) {
      throw new AppError("حداقل یک فیلد برای ویرایش ارسال کنید", 400);
    }

    const existing = await prisma.teacher.findUnique({ where: { id } });

    if (!existing) {
      if (data.avatar) {
        await removeCloudinaryImage(data.avatar);
      }
      throw new AppError("مدرس مورد نظر یافت نشد", 404);
    }

    const updateData: Prisma.TeacherUpdateInput = {};

    if (data.name !== undefined) {
      updateData.name = data.name;
      updateData.slug = createSlug(data.name);
    }

    if (data.bio !== undefined) {
      updateData.bio = data.bio;
    }

    if (data.avatar) {
      if (existing.avatar) {
        await removeCloudinaryImage(existing.avatar);
      }
      updateData.avatar = data.avatar;
    }

    try {
      const teacher = await prisma.teacher.update({
        where: { id },
        data: updateData,
        select: teacherSelect,
      });

      return teacher;
    } catch (error) {
      if (data.avatar) {
        await removeCloudinaryImage(data.avatar);
      }

      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new AppError("مدرسی با این نام قبلاً ثبت شده است", 400, {
          name: "این نام قبلاً استفاده شده است",
        });
      }

      throw error;
    }
  },
  async deleteTeacher(id: string) {
    const existing = await prisma.teacher.findUnique({
      where: { id },
      include: { _count: { select: { courses: true } } },
    });

    if (!existing) {
      throw new AppError("مدرس مورد نظر یافت نشد", 404);
    }

    if (existing._count.courses > 0) {
      throw new AppError(
        `این مدرس ${existing._count.courses} دوره دارد. ابتدا دوره‌ها را حذف یا به مدرس دیگری منتقل کنید`,
        400,
      );
    }

    await prisma.teacher.delete({ where: { id } });

    if (existing.avatar) {
      await removeCloudinaryImage(existing.avatar);
    }
  },

  async getTeachers(query: ListTeachersQuery) {
    const { skip, take, page, limit } = parsePagination(query);

    const where: Prisma.TeacherWhereInput = {};

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: "insensitive" } },
        { bio: { contains: query.search, mode: "insensitive" } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.teacher.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        select: {
          ...teacherSelect,
          _count: { select: { courses: true } },
        },
      }),
      prisma.teacher.count({ where }),
    ]);

    const formattedItems = items.map(({ _count, ...teacher }) => ({
      ...teacher,
      coursesCount: _count.courses,
    }));

    return {
      items: formattedItems,
      pagination: buildPaginationMeta(total, page, limit),
    };
  },

  async getTeacherBySlug(slug: string) {
    const teacher = await prisma.teacher.findUnique({
      where: { slug },
      select: {
        ...teacherSelect,
        courses: {
          where: {
            published: true,
            category: { show: true },
          },
          select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            price: true,
            imageUrl: true,
            level: true,
            createdAt: true,
            category: {
              select: { id: true, name: true, slug: true },
            },
            _count: {
              select: { enrollments: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!teacher) {
      throw new AppError("مدرس مورد نظر یافت نشد", 404);
    }

    const { courses, ...rest } = teacher;

    return {
      ...rest,
      courses: courses.map(({ _count, ...course }) => ({
        ...course,
        studentsCount: _count.enrollments,
      })),
    };
  },
};
