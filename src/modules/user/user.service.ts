import { Prisma } from "../../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { removeCloudinaryImage } from "../../utils/cloudinary.js";
import {
  buildPaginationMeta,
  parsePagination,
} from "../../utils/pagination.js";
import { ListUsersQuery, UpdateProfileInput } from "./user.validator.js";

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
        role: true,
        createdAt: true,
        updatedAt: true,
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
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        role: true,
      },
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

  async getUsers(query: ListUsersQuery) {
    const { skip, take, page, limit } = parsePagination(query);

    const where: Prisma.UserWhereInput = {};

    if (query.role) {
      where.role = query.role;
    }

    if (query.isVerified !== undefined) {
      where.isVerified = query.isVerified === "true";
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: "insensitive" } },
        { email: { contains: query.search, mode: "insensitive" } },
      ];
    }

    const sortBy = query.sortBy || "createdAt";
    const order = query.order || "desc";

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: order },
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          avatar: true,
          role: true,
          isVerified: true,
          createdAt: true,
          _count: {
            select: {
              enrollments: true,
              orders: true,
              comments: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    const formattedItems = items.map(({ _count, ...user }) => ({
      ...user,
      stats: {
        enrollments: _count.enrollments,
        orders: _count.orders,
        comments: _count.comments,
      },
    }));

    return {
      items: formattedItems,
      pagination: buildPaginationMeta(total, page, limit),
    };
  },

  async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        role: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
        wallet: {
          select: { balance: true },
        },
        _count: {
          select: {
            enrollments: true,
            orders: true,
            comments: true,
            favoriteCourses: true,
            favoriteBlogs: true,
            reactions: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError("کاربر مورد نظر یافت نشد", 404);
    }

    const { _count, wallet, ...rest } = user;

    return {
      ...rest,
      walletBalance: wallet?.balance ?? 0,
      stats: {
        enrollments: _count.enrollments,
        orders: _count.orders,
        comments: _count.comments,
        favoriteCourses: _count.favoriteCourses,
        favoritePosts: _count.favoriteBlogs,
        reactions: _count.reactions,
      },
    };
  },
};
