import { RequestHandler } from "express";
import { userService } from "./user.service.js";
import { ListUsersQuery } from "./user.validator.js";

export const getProfileController: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const profile = await userService.getProfile(userId);

  return res.status(200).json({
    status: "success",
    data: {
      profile,
    },
  });
};

export const updateProfileController: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const { name, phone } = req.body;

  let avatarPath: string | undefined;
  if (req.file) {
    avatarPath = req.file.path;
  }

  if (!name && !phone && !avatarPath) {
    return res.status(400).json({
      status: "fail",
      data: {
        message: "حداقل یک فیلد برای ویرایش ارسال کنید",
      },
    });
  }

  const updateData: { name?: string; phone?: string; avatar?: string } = {};
  if (name) updateData.name = name;
  if (phone) updateData.phone = phone;
  if (avatarPath) updateData.avatar = avatarPath;

  const updatedProfile = await userService.updateProfile(userId, updateData);

  return res.status(200).json({
    status: "success",
    data: {
      message: "پروفایل شما با موفقیت به‌روزرسانی شد",
      profile: updatedProfile,
    },
  });
};

export const deleteAvatarController: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  await userService.deleteAvatar(userId);

  return res.status(200).json({
    status: "success",
    data: {
      message: "تصویر پروفایل شما با موفقیت حذف شد",
    },
  });
};

export const getProfileOverviewController: RequestHandler = async (
  req,
  res,
) => {
  const userId = req.user!.id;
  const overview = await userService.getProfileOverview(userId);

  return res.status(200).json({
    status: "success",
    data: { overview },
  });
};

export const getUsersController: RequestHandler = async (req, res) => {
  const result = await userService.getUsers(req.query as ListUsersQuery);

  return res.status(200).json({
    status: "success",
    data: result,
  });
};

export const getUserByIdController: RequestHandler = async (req, res) => {
  const id = req.params.id as string;
  const user = await userService.getUserById(id);

  return res.status(200).json({
    status: "success",
    data: { user },
  });
};
