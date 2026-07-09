import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import {
  calculateDiscountAmount,
  validateDiscount,
} from "../discount/discount.service.js";
import { cartInclude, CartWithItems } from "./cart.types.js";

const formatCart = (cart: CartWithItems) => {
  const formattedItems = cart.items.map((item) => ({
    id: item.id,
    courseId: item.course.id,
    title: item.course.title,
    slug: item.course.slug,
    price: item.course.price,
    imageUrl: item.course.imageUrl,
    level: item.course.level,
    category: item.course.category,
    addedAt: item.createdAt,
  }));

  const totalAmount = formattedItems.reduce((sum, i) => sum + i.price, 0);

  return {
    id: cart.id,
    totalAmount,
    totalItems: formattedItems.length,
    items: formattedItems,
  };
};

export const cartService = {
  async getOrCreateCart(userId: string) {
    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: cartInclude,
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: cartInclude,
      });
    }

    return cart;
  },

  async addItem(userId: string, courseId: string) {
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        published: true,
        category: { show: true },
      },
      select: { id: true, title: true, price: true },
    });

    if (!course) {
      throw new AppError("دوره مورد نظر یافت نشد یا غیرفعال است", 404);
    }

    if (course.price === 0) {
      throw new AppError(
        "دوره‌های رایگان نیازی به سبد خرید ندارند. مستقیم ثبت‌نام کنید",
        400,
      );
    }

    const isEnrolled = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });

    if (isEnrolled) {
      throw new AppError("شما قبلاً این دوره را خریداری کرده‌اید", 400);
    }

    const cart = await this.getOrCreateCart(userId);

    const alreadyInCart = cart.items.some((i) => i.courseId === courseId);
    if (alreadyInCart) {
      throw new AppError("این دوره از قبل در سبد خرید شما موجود است", 409);
    }

    await prisma.cartItem.create({
      data: { cartId: cart.id, courseId },
    });

    return {
      message: "دوره به سبد خرید اضافه شد",
    };
  },

  async getCart(userId: string) {
    const cart = await this.getOrCreateCart(userId);
    const formatted = formatCart(cart);

    const { totalAmount, ...rest } = formatted;
    const subtotal = totalAmount;

    if (cart.discountCode) {
      try {
        const discount = await validateDiscount(cart.discountCode);
        const amount = calculateDiscountAmount(subtotal, discount);

        return {
          ...rest,
          subtotal,
          discount: {
            code: discount.code,
            type: discount.type,
            value: discount.value,
            amount,
          },
          totalPayment: subtotal - amount,
        };
      } catch {
        await prisma.cart.update({
          where: { userId },
          data: { discountCode: null },
        });
      }
    }

    return {
      ...rest,
      subtotal,
      discount: null,
      totalPayment: subtotal,
    };
  },

  async removeItem(userId: string, courseId: string) {
    const cart = await this.getOrCreateCart(userId);

    const item = cart.items.find((i) => i.courseId === courseId);
    if (!item) {
      throw new AppError("این دوره در سبد خرید شما یافت نشد", 404);
    }

    await prisma.cartItem.delete({
      where: { id: item.id },
    });

    return {
      message: "دوره از سبد خرید حذف شد",
    };
  },

  async clearCart(userId: string) {
    const cart = await this.getOrCreateCart(userId);

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return {
      message: "سبد خرید با موفقیت خالی شد",
    };
  },
};
