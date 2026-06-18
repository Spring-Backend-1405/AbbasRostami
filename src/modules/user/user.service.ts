import fs from "fs";
import path from "path";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { UpdateProfileInput } from "./user.validator.js";

const removePhysicalFile = (relativeFilePath: string) => {
  try {
    const filePath = path.resolve(process.cwd(), "public", relativeFilePath);
    const safeDir = path.resolve(process.cwd(), "public", "uploads");

    if (!filePath.startsWith(safeDir)) {
      console.warn("⚠️ تلاش برای حذف فایل خارج از مسیر مجاز:", filePath);
      return;
    }

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.error("❌ خطا در حذف فایل:", err);
  }
};

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
        removePhysicalFile(currentUser.avatar);
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
      removePhysicalFile(user.avatar);
    }

    return prisma.user.update({
      where: { id: userId },
      data: { avatar: null },
      select: { id: true, avatar: true },
    });
  },
};
