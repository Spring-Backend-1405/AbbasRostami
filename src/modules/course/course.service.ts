import fs from "fs";
import path from "path";
import { Prisma } from "../../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import {
  buildPaginationMeta,
  parsePagination,
} from "../../utils/pagination.js";
import {
  getMyReaction,
  getReactionCounts,
  getReactionCountsForList,
} from "../../utils/reactionHelper.js";
import { createSlug } from "../../utils/slug.util.js";
import {
  courseInclude,
  CourseWithRelations,
  CourseWithStats,
  CreateCourseInputWithImage,
  UpdateCourseInputWithImage,
} from "./course.types.js";
import {
  ListCoursesAdminQuery,
  ListCoursesPublicQuery,
} from "./course.validator.js";

const formatCourse = (course: CourseWithRelations) => {
  const { _count, ...rest } = course;
  return {
    ...rest,
    stats: {
      enrollments: _count.enrollments,
      comments: _count.comments,
    },
  };
};

const formatCourses = (courses: CourseWithRelations[]): CourseWithStats[] =>
  courses.map(formatCourse);

const addEnrollmentInfo = async (course: CourseWithStats, userId?: string) => {
  if (!userId) {
    return { ...course, isEnrolled: false, enrollment: null };
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId: course.id,
      },
    },
    select: {
      id: true,
      pricePaid: true,
      createdAt: true,
    },
  });

  return {
    ...course,
    isEnrolled: !!enrollment,
    enrollment: enrollment || null,
  };
};

const addEnrollmentInfoToList = async (
  courses: CourseWithStats[],
  userId?: string,
) => {
  if (!userId || courses.length === 0) {
    return courses.map((c) => ({ ...c, isEnrolled: false }));
  }

  const enrollments = await prisma.enrollment.findMany({
    where: {
      userId,
      courseId: { in: courses.map((c) => c.id) },
    },
    select: { courseId: true },
  });

  const enrolledCourseIds = new Set(enrollments.map((e) => e.courseId));

  return courses.map((course) => ({
    ...course,
    isEnrolled: enrolledCourseIds.has(course.id),
  }));
};

const handleUniqueError = (error: unknown): never => {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    throw new AppError("دوره‌ای با این عنوان قبلاً ثبت شده است", 400, {
      title: "این عنوان قبلاً استفاده شده است",
    });
  }
  throw error;
};

const validateCategoryExists = async (categoryId: string) => {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    throw new AppError("دسته‌بندی مورد نظر یافت نشد", 400, {
      categoryId: "این دسته‌بندی وجود ندارد",
    });
  }
};

const removePhysicalFile = (relativeFilePath: string) => {
  try {
    const filePath = path.join(process.cwd(), "public", relativeFilePath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.error("❌ خطا در حذف فایل:", err);
  }
};

export const courseService = {
  async createCourse(data: CreateCourseInputWithImage) {
    if (data.categoryId) {
      await validateCategoryExists(data.categoryId);
    }

    try {
      const course = await prisma.course.create({
        data: {
          title: data.title,
          slug: createSlug(data.title),
          description: data.description,
          price: data.price,
          level: data.level,
          imageUrl: data.imageUrl,
          categoryId: data.categoryId,
          published: data.published,
        },
        include: courseInclude,
      });

      return formatCourse(course);
    } catch (error) {
      if (data.imageUrl) {
        removePhysicalFile(data.imageUrl);
      }
      handleUniqueError(error);
      throw error;
    }
  },

  async updateCourse(id: string, data: UpdateCourseInputWithImage) {
    const existing = await prisma.course.findUnique({ where: { id } });
    if (!existing) {
      if (data.imageUrl) {
        removePhysicalFile(data.imageUrl);
      }
      throw new AppError("دوره مورد نظر یافت نشد", 404);
    }

    if (data.categoryId) {
      await validateCategoryExists(data.categoryId);
    }

    const updateData: Prisma.CourseUpdateInput = {};

    if (data.title !== undefined) {
      updateData.title = data.title;
      updateData.slug = createSlug(data.title);
    }
    if (data.description !== undefined) {
      updateData.description = data.description;
    }
    if (data.price !== undefined) {
      updateData.price = data.price;
    }
    if (data.level !== undefined) {
      updateData.level = data.level;
    }
    if (data.categoryId !== undefined) {
      updateData.category = data.categoryId
        ? { connect: { id: data.categoryId } }
        : { disconnect: true };
    }

    if (data.imageUrl) {
      if (existing.imageUrl) {
        removePhysicalFile(existing.imageUrl);
      }
      updateData.imageUrl = data.imageUrl;
    }

    try {
      const course = await prisma.course.update({
        where: { id },
        data: updateData,
        include: courseInclude,
      });

      return formatCourse(course);
    } catch (error) {
      if (data.imageUrl) {
        removePhysicalFile(data.imageUrl);
      }
      handleUniqueError(error);
      throw error;
    }
  },

  async togglePublish(id: string, published: boolean) {
    const existing = await prisma.course.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!existing) {
      throw new AppError("دوره مورد نظر یافت نشد", 404);
    }

    if (existing.published === published) {
      throw new AppError(
        published ? "دوره از قبل منتشر شده است" : "دوره از قبل پنهان است",
        400,
      );
    }

    if (published && existing.category && !existing.category.show) {
      throw new AppError(
        "نمی‌توان دوره را منتشر کرد چون دسته‌بندی آن غیرفعال است",
        400,
      );
    }

    const course = await prisma.course.update({
      where: { id },
      data: { published },
      include: courseInclude,
    });

    return formatCourse(course);
  },

  async deleteCourse(id: string) {
    const existing = await prisma.course.findUnique({ where: { id } });

    if (!existing) {
      throw new AppError("دوره مورد نظر یافت نشد", 404);
    }

    if (existing.imageUrl) {
      removePhysicalFile(existing.imageUrl);
    }

    await prisma.course.delete({ where: { id } });
  },

  async getPublicCourses(query: ListCoursesPublicQuery, userId?: string) {
    const { skip, take, page, limit } = parsePagination(query);

    const where: Prisma.CourseWhereInput = {
      published: true,
      OR: [{ categoryId: null }, { category: { show: true } }],
    };

    if (query.category) {
      where.category = { slug: query.category, show: true };
    }

    if (query.level) {
      where.level = query.level;
    }

    if (query.minPrice || query.maxPrice) {
      where.price = {};
      if (query.minPrice) where.price.gte = Number(query.minPrice);
      if (query.maxPrice) where.price.lte = Number(query.maxPrice);
    }

    if (query.search) {
      where.AND = [
        {
          OR: [
            { title: { contains: query.search, mode: "insensitive" } },
            { description: { contains: query.search, mode: "insensitive" } },
          ],
        },
      ];
    }

    const sortBy = query.sortBy || "createdAt";
    const order = query.order || "desc";
    const orderBy = { [sortBy]: order };

    const [items, total] = await Promise.all([
      prisma.course.findMany({
        where,
        skip,
        take,
        orderBy,
        include: courseInclude,
      }),
      prisma.course.count({ where }),
    ]);
    const formattedCourses = formatCourses(items);

    const coursesWithEnrollment = await addEnrollmentInfoToList(
      formattedCourses,
      userId,
    );

    const courseIds = formattedCourses.map((c) => c.id);
    const reactionMap = await getReactionCountsForList(
      "courseId",
      courseIds,
      userId,
    );

    const finalItems = coursesWithEnrollment.map((course) => ({
      ...course,
      reactions: reactionMap.get(course.id) ?? {
        likes: 0,
        dislikes: 0,
        myReaction: null,
      },
    }));

    return {
      items: finalItems,
      pagination: buildPaginationMeta(total, page, limit),
    };
  },

  async getAdminCourses(query: ListCoursesAdminQuery) {
    const { skip, take, page, limit } = parsePagination(query);

    const where: Prisma.CourseWhereInput = {};

    if (query.category) {
      where.category = { slug: query.category };
    }

    if (query.level) {
      where.level = query.level;
    }

    if (query.published !== undefined) {
      where.published = query.published === "true";
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: "insensitive" } },
        { description: { contains: query.search, mode: "insensitive" } },
      ];
    }

    const sortBy = query.sortBy || "createdAt";
    const order = query.order || "desc";
    const orderBy = { [sortBy]: order };

    const [items, total] = await Promise.all([
      prisma.course.findMany({
        where,
        skip,
        take,
        orderBy,
        include: courseInclude,
      }),
      prisma.course.count({ where }),
    ]);

    return {
      items: formatCourses(items),
      pagination: buildPaginationMeta(total, page, limit),
    };
  },

  async getCourseBySlug(slug: string, userId?: string) {
    const course = await prisma.course.findFirst({
      where: {
        slug,
        published: true,
        OR: [{ categoryId: null }, { category: { show: true } }],
      },
      include: courseInclude,
    });

    if (!course) {
      throw new AppError("دوره مورد نظر یافت نشد", 404);
    }

    const formattedCourse = formatCourse(course);
    const courseWithEnrollment = await addEnrollmentInfo(
      formattedCourse,
      userId,
    );

    const [counts, myReaction] = await Promise.all([
      getReactionCounts("courseId", course.id),
      getMyReaction("courseId", course.id, userId),
    ]);

    return {
      ...courseWithEnrollment,
      reactions: {
        ...counts,
        myReaction,
      },
    };
  },
};
