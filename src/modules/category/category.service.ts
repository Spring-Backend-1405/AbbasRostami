import { Prisma } from "../../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import {
  buildPaginationMeta,
  parsePagination,
} from "../../utils/pagination.js";
import { createSlug } from "../../utils/slug.util.js";
import {
  CreateCategoryInput,
  ListCategoriesAdminQuery,
  UpdateCategoryInput,
} from "./category.validator.js";

// ─── Helper: include count ──────────────────────
const categoryWithCount = {
  _count: {
    select: { courses: true, posts: true },
  },
};

const categoryWithPublishedCount = {
  _count: {
    select: {
      courses: { where: { published: true } },
      posts: { where: { published: true } },
    },
  },
};

// ─── Helper: handle unique errors ───────────────
const handleUniqueError = (error: unknown): never => {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    throw new AppError("دسته بندی‌ای با این نام قبلاً ثبت شده است", 400, {
      name: "این نام قبلاً استفاده شده است",
    });
  }
  throw error;
};

export const categoryService = {
  async createCategory(data: CreateCategoryInput) {
    try {
      return await prisma.category.create({
        data: {
          name: data.name,
          slug: createSlug(data.name),
          description: data.description,
          show: data.show,
        },
      });
    } catch (error) {
      handleUniqueError(error);
    }
  },

  async getPublicCategories() {
    return prisma.category.findMany({
      where: { show: true },
      orderBy: { createdAt: "desc" },
      include: categoryWithPublishedCount,
    });
  },

  async getAdminCategories(query: ListCategoriesAdminQuery) {
    const { skip, take, page, limit } = parsePagination(query);

    const where: Prisma.CategoryWhereInput = {};

    if (query.show !== undefined) {
      where.show = query.show === "true";
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: "insensitive" } },
        { description: { contains: query.search, mode: "insensitive" } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.category.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: categoryWithCount,
      }),
      prisma.category.count({ where }),
    ]);

    return {
      items,
      pagination: buildPaginationMeta(total, page, limit),
    };
  },

  async getCategoryBySlug(slug: string) {
    const category = await prisma.category.findFirst({
      where: { slug, show: true },
      include: categoryWithPublishedCount,
    });

    if (!category) {
      throw new AppError("دسته بندی مورد نظر یافت نشد", 404);
    }

    return category;
  },

  async updateCategory(id: string, data: UpdateCategoryInput) {
    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError("دسته بندی مورد نظر یافت نشد", 404);
    }

    const updateData: Prisma.CategoryUpdateInput = {};

    if (data.name !== undefined) {
      updateData.name = data.name;
      updateData.slug = createSlug(data.name);
    }

    if (data.description !== undefined) {
      updateData.description = data.description;
    }

    try {
      return await prisma.category.update({
        where: { id },
        data: updateData,
      });
    } catch (error) {
      handleUniqueError(error);
    }
  },

  // ✅ ساده‌سازی شد
  async toggleVisibility(id: string, show: boolean) {
    return prisma.$transaction(async (tx) => {
      const existing = await tx.category.findUnique({ where: { id } });

      if (!existing) {
        throw new AppError("دسته بندی مورد نظر یافت نشد", 404);
      }

      if (existing.show === show) {
        throw new AppError(
          show ? "دسته بندی از قبل فعال است" : "دسته بندی از قبل غیرفعال است",
          400,
        );
      }

      const category = await tx.category.update({
        where: { id },
        data: { show },
      });

      // اگه غیرفعال می‌کنیم، دوره‌ها و پست‌ها رو هم unpublish کن
      if (!show) {
        await tx.course.updateMany({
          where: { categoryId: id, published: true },
          data: { published: false },
        });

        await tx.post.updateMany({
          where: { categoryId: id, published: true },
          data: { published: false },
        });
      }

      return category;
    });
  },

  // ✅ ساده‌سازی شد
  async deleteCategory(id: string) {
    const existing = await prisma.category.findUnique({ where: { id } });

    if (!existing) {
      throw new AppError("دسته بندی مورد نظر یافت نشد", 404);
    }

    await prisma.category.delete({ where: { id } });
  },
};
