import { RequestHandler } from "express";
import { userService } from "./user.service.js";

export const getProfileController: RequestHandler = async (req, res) => {
  const userId = String(req.user!.id);
  const profile = await userService.getProfile(userId);

  return res.status(200).json({
    status: "success",
    data: {
      profile,
    },
  });
};

export const updateProfileController: RequestHandler = async (req, res) => {
  const userId = String(req.user!.id);
  const { name, phone } = req.body;

  let avatarPath: string | undefined = undefined;
  if (req.file) {
    avatarPath = `/uploads/avatars/${req.file.filename}`;
  }

  const updatedProfile = await userService.updateProfile(userId, {
    name,
    phone,
    avatar: avatarPath,
  });

  return res.status(200).json({
    status: "success",
    data: {
      message: "پروفایل شما با موفقیت به‌روزرسانی شد",
      profile: updatedProfile,
    },
  });
};

export const deleteAvatarController: RequestHandler = async (req, res) => {
  const userId = String(req.user!.id);
  await userService.deleteAvatar(userId);

  return res.status(200).json({
    status: "success",
    data: {
      message: "تصویر پروفایل شما با موفقیت حذف شد",
    },
  });
};
