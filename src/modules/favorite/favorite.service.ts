import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import {
  buildPaginationMeta,
  parsePagination,
} from "../../utils/pagination.js";
import {
  courseFavoriteInclude,
  CourseFavoriteWithRelations,
  postFavoriteInclude,
  PostFavoriteWithRelations,
} from "./favorite.types.js";
import { ListFavoritesQuery } from "./favorite.validator.js";

const formatCourseFavorite = (item: CourseFavoriteWithRelations) => {
  const { _count, categoryId, ...courseRest } = item.course;
  return {
    id: item.id,
    savedAt: item.createdAt,
    course: {
      ...courseRest,
      stats: _count,
    },
  };
};
const formatPostFavorite = (item: PostFavoriteWithRelations) => {
  const { _count, categoryId, ...postRest } = item.post;
  return {
    id: item.id,
    savedAt: item.createdAt,
    post: {
      ...postRest,
      stats: _count,
    },
  };
};

export const favoriteService = {
  async toggleCourseFavorite(userId: string, courseId: string) {
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        published: true,
        OR: [{ categoryId: null }, { category: { show: true } }],
      },
      select: { id: true, title: true },
    });

    if (!course) {
      throw new AppError("دوره مورد نظر یافت نشد", 404);
    }

    const existing = await prisma.courseFavorite.findUnique({
      where: {
        userId_courseId: { userId, courseId },
      },
    });

    if (existing) {
      await prisma.courseFavorite.delete({
        where: { userId_courseId: { userId, courseId } },
      });

      return {
        message: "دوره از علاقه‌مندی‌ها حذف شد",
        isFavorite: false,
      };
    }

    await prisma.courseFavorite.create({
      data: { userId, courseId },
    });

    return {
      message: "دوره به علاقه‌مندی‌ها اضافه شد",
      isFavorite: true,
    };
  },

  async getMyCourseFavorites(userId: string, query: ListFavoritesQuery) {
    const { skip, take, page, limit } = parsePagination(query);

    const [items, total] = await Promise.all([
      prisma.courseFavorite.findMany({
        where: { userId },
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: courseFavoriteInclude,
      }),
      prisma.courseFavorite.count({ where: { userId } }),
    ]);

    return {
      items: items.map(formatCourseFavorite),
      pagination: buildPaginationMeta(total, page, limit),
    };
  },

  async togglePostFavorite(userId: string, postId: string) {
    const post = await prisma.post.findFirst({
      where: {
        id: postId,
        published: true,
        OR: [{ categoryId: null }, { category: { show: true } }],
      },
      select: { id: true, title: true },
    });

    if (!post) {
      throw new AppError("پست مورد نظر یافت نشد", 404);
    }

    const existing = await prisma.blogFavorite.findUnique({
      where: {
        userId_postId: { userId, postId },
      },
    });

    if (existing) {
      await prisma.blogFavorite.delete({
        where: { userId_postId: { userId, postId } },
      });

      return {
        message: "پست از علاقه‌مندی‌ها حذف شد",
        isFavorite: false,
      };
    }

    await prisma.blogFavorite.create({
      data: { userId, postId },
    });

    return {
      message: "پست به علاقه‌مندی‌ها اضافه شد",
      isFavorite: true,
    };
  },

  async getMyPostFavorites(userId: string, query: ListFavoritesQuery) {
    const { skip, take, page, limit } = parsePagination(query);

    const [items, total] = await Promise.all([
      prisma.blogFavorite.findMany({
        where: { userId },
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: postFavoriteInclude,
      }),
      prisma.blogFavorite.count({ where: { userId } }),
    ]);

    return {
      items: items.map(formatPostFavorite),
      pagination: buildPaginationMeta(total, page, limit),
    };
  },
};
