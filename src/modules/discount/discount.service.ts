import { Prisma } from "../../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import {
  buildPaginationMeta,
  parsePagination,
} from "../../utils/pagination.js";
import {
  ApplyDiscountInput,
  CreateDiscountInput,
  ListDiscountsQuery,
} from "./discount.validator.js";

export const validateDiscount = async (code: string) => {
  const discount = await prisma.discount.findUnique({
    where: { code },
  });

  if (!discount) {
    throw new AppError("کد تخفیف یافت نشد", 404);
  }

  if (!discount.active) {
    throw new AppError("این کد تخفیف غیرفعال است", 400);
  }

  if (discount.expiresAt < new Date()) {
    throw new AppError("این کد تخفیف منقضی شده است", 410);
  }

  if (discount.usedCount >= discount.maxUses) {
    throw new AppError("ظرفیت استفاده از این کد تمام شده است", 400);
  }

  return discount;
};

export const calculateDiscountAmount = (
  subtotal: number,
  discount: { type: string; value: number },
): number => {
  if (discount.type === "PERCENTAGE") {
    return Math.floor((subtotal * discount.value) / 100);
  }
  return Math.min(discount.value, subtotal);
};

export const discountService = {
  async createDiscount(data: CreateDiscountInput) {
    const existing = await prisma.discount.findUnique({
      where: { code: data.code },
    });

    if (existing) {
      throw new AppError("کدی با این نام قبلاً ثبت شده است", 409, {
        code: "این کد قبلاً استفاده شده است",
      });
    }

    const expiresAt = new Date(
      Date.now() + data.expiresInDays * 24 * 60 * 60 * 1000,
    );

    return prisma.discount.create({
      data: {
        code: data.code,
        type: data.type,
        value: data.value,
        maxUses: data.maxUses,
        expiresAt,
      },
    });
  },

  async listDiscounts(query: ListDiscountsQuery) {
    const { skip, take, page, limit } = parsePagination(query);

    const where: Prisma.DiscountWhereInput = {};

    if (query.active !== undefined) {
      where.active = query.active === "true";
    }

    if (query.search) {
      where.code = { contains: query.search, mode: "insensitive" };
    }

    const [items, total] = await Promise.all([
      prisma.discount.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
      }),
      prisma.discount.count({ where }),
    ]);

    return {
      items,
      pagination: buildPaginationMeta(total, page, limit),
    };
  },

  async toggleDiscount(id: string) {
    const discount = await prisma.discount.findUnique({ where: { id } });

    if (!discount) {
      throw new AppError("کد تخفیف یافت نشد", 404);
    }

    if (!discount.active && discount.expiresAt < new Date()) {
      throw new AppError(
        "نمی‌توان کد منقضی شده را فعال کرد. ابتدا کد جدید بسازید",
        410,
      );
    }

    if (!discount.active && discount.usedCount >= discount.maxUses) {
      throw new AppError(
        "نمی‌توان کد را فعال کرد، ظرفیت استفاده تمام شده است",
        400,
      );
    }

    return prisma.discount.update({
      where: { id },
      data: { active: !discount.active },
    });
  },

  async deleteDiscount(id: string) {
    const discount = await prisma.discount.findUnique({ where: { id } });

    if (!discount) {
      throw new AppError("کد تخفیف یافت نشد", 404);
    }

    await prisma.discount.delete({ where: { id } });
  },

  async applyDiscountToCart(userId: string, data: ApplyDiscountInput) {
    const discount = await validateDiscount(data.code);

    await prisma.cart.upsert({
      where: { userId },
      create: { userId, discountCode: discount.code },
      update: { discountCode: discount.code },
    });

    return {
      message: "کد تخفیف با موفقیت اعمال شد",
      discount: {
        code: discount.code,
        type: discount.type,
        value: discount.value,
      },
    };
  },

  async removeDiscountFromCart(userId: string) {
    const cart = await prisma.cart.findUnique({ where: { userId } });

    if (!cart) {
      throw new AppError("سبد خرید یافت نشد", 404);
    }

    if (!cart.discountCode) {
      throw new AppError("کد تخفیفی در سبد شما نیست", 400);
    }

    await prisma.cart.update({
      where: { userId },
      data: { discountCode: null },
    });

    return { message: "کد تخفیف از سبد حذف شد" };
  },
};
