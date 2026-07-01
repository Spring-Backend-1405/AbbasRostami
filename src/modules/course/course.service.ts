import { Prisma } from "../../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { removeCloudinaryImage } from "../../utils/cloudinary.js";
import {
  buildPaginationMeta,
  parsePagination,
} from "../../utils/pagination.js";
import {
  getMyReaction,
  getReactionCounts,
  getReactionCountsForList,
} from "../../utils/reactionHelper.js";
import { createSlug } from "../../utils/slug.js";
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
  const { _count, categoryId, ...rest } = course;
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
        removeCloudinaryImage(data.imageUrl);
      }
      handleUniqueError(error);
      throw error;
    }
  },

  async updateCourse(id: string, data: UpdateCourseInputWithImage) {
    const existing = await prisma.course.findUnique({ where: { id } });
    if (!existing) {
      if (data.imageUrl) {
        removeCloudinaryImage(data.imageUrl);
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
    if (data.published !== undefined) {
      updateData.published = data.published;
    }
    if (data.categoryId !== undefined) {
      updateData.category = data.categoryId
        ? { connect: { id: data.categoryId } }
        : { disconnect: true };
    }

    if (data.imageUrl) {
      if (existing.imageUrl) {
        removeCloudinaryImage(existing.imageUrl);
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
        removeCloudinaryImage(data.imageUrl);
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
      removeCloudinaryImage(existing.imageUrl);
    }

    await prisma.course.delete({ where: { id } });
  },

  async getPublicCourses(query: ListCoursesPublicQuery, userId?: string) {
    const { skip, take, page, limit } = parsePagination(query);

    const where: Prisma.CourseWhereInput = {
      published: true,
      OR: [{ categoryId: null }, { category: { show: true } }],
    };

    if (query.categories && query.categories.length > 0) {
      where.category = {
        slug: { in: query.categories },
        show: true,
      };
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
    const courseIds = formattedCourses.map((c) => c.id);

    const [enrolledIds, reactionMap, favoriteIds] = await Promise.all([
      userId && courseIds.length > 0
        ? prisma.enrollment
            .findMany({
              where: { userId, courseId: { in: courseIds } },
              select: { courseId: true },
            })
            .then((e) => new Set(e.map((x) => x.courseId)))
        : Promise.resolve(new Set<string>()),

      getReactionCountsForList("courseId", courseIds, userId),

      userId && courseIds.length > 0
        ? prisma.courseFavorite
            .findMany({
              where: { userId, courseId: { in: courseIds } },
              select: { courseId: true },
            })
            .then((f) => new Set(f.map((x) => x.courseId)))
        : Promise.resolve(new Set<string>()),
    ]);

    const finalItems = formattedCourses.map((course) => ({
      ...course,
      isEnrolled: enrolledIds.has(course.id),
      reactions: reactionMap.get(course.id) ?? {
        likes: 0,
        dislikes: 0,
        myReaction: null,
      },
      isFavorite: favoriteIds.has(course.id),
    }));

    return {
      items: finalItems,
      pagination: buildPaginationMeta(total, page, limit),
    };
  },

  async getAdminCourses(query: ListCoursesAdminQuery) {
    const { skip, take, page, limit } = parsePagination(query);

    const where: Prisma.CourseWhereInput = {};

    if (query.categories && query.categories.length > 0) {
      where.category = {
        slug: { in: query.categories },
      };
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

    const [enrollment, counts, myReaction, favorite] = await Promise.all([
      userId
        ? prisma.enrollment.findUnique({
            where: { userId_courseId: { userId, courseId: course.id } },
            select: { id: true, pricePaid: true, createdAt: true },
          })
        : Promise.resolve(null),
      getReactionCounts("courseId", course.id),
      getMyReaction("courseId", course.id, userId),
      userId
        ? prisma.courseFavorite.findUnique({
            where: { userId_courseId: { userId, courseId: course.id } },
            select: { id: true },
          })
        : Promise.resolve(null),
    ]);

    return {
      ...formattedCourse,
      isEnrolled: !!enrollment,
      enrollment: enrollment || null,
      reactions: { ...counts, myReaction },
      isFavorite: !!favorite,
    };
  },
};
