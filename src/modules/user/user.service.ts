import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { removeCloudinaryImage } from "../../utils/cloudinary.js";
import { UpdateProfileInput } from "./user.validator.js";

export const userService = {
  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AppError("کاربر مورد نظر یافت نشد", 404);
    }
    return user;
  },

  async updateProfile(
    userId: string,
    data: UpdateProfileInput & { avatar?: string },
  ) {
    if (data.avatar) {
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { avatar: true },
      });

      if (currentUser?.avatar) {
        removeCloudinaryImage(currentUser.avatar);
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, email: true, name: true, phone: true, avatar: true },
    });

    return updatedUser;
  },

  async deleteAvatar(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatar: true },
    });

    if (user?.avatar) {
      removeCloudinaryImage(user.avatar);
    }

    return prisma.user.update({
      where: { id: userId },
      data: { avatar: null },
      select: { id: true, avatar: true },
    });
  },

  async getProfileOverview(userId: string) {
    const [
      enrollments,
      orders,
      pendingOrders,
      wallet,
      comments,
      pendingComments,
      favoriteCourses,
      favoritePosts,
      cartItems,
      reactions,
    ] = await Promise.all([
      prisma.enrollment.count({ where: { userId } }),
      prisma.order.count({ where: { userId } }),
      prisma.order.count({ where: { userId, status: "PENDING" } }),
      prisma.wallet.findUnique({
        where: { userId },
        select: { balance: true },
      }),
      prisma.comment.count({ where: { userId } }),
      prisma.comment.count({ where: { userId, status: "PENDING" } }),
      prisma.courseFavorite.count({ where: { userId } }),
      prisma.blogFavorite.count({ where: { userId } }),
      prisma.cartItem.count({
        where: { cart: { userId } },
      }),
      prisma.reaction.count({ where: { userId } }),
    ]);

    return {
      enrollment: { total: enrollments },
      order: { total: orders, active: pendingOrders },
      wallet: { balance: wallet?.balance ?? 0 },
      comment: { total: comments, pending: pendingComments },
      favorite: { courses: favoriteCourses, posts: favoritePosts },
      cart: { items: cartItems },
      reaction: { total: reactions },
    };
  },
};
