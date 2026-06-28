import { RequestHandler } from "express";
import { AppError } from "../../utils/AppError.js";
import { authService } from "./auth.service.js";

const ACCESS_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 15 * 60 * 1000,
};

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const registerController: RequestHandler = async (req, res) => {
  const result = await authService.register(req.body);

  return res.status(201).json({
    status: "success",
    data: {
      email: result.email,
      message: result.message,
    },
  });
};

export const verifyEmailController: RequestHandler = async (req, res) => {
  const { accessToken, refreshToken, user } = await authService.verifyEmail(
    req.body,
  );

  res.cookie("accessToken", accessToken, ACCESS_COOKIE_OPTIONS);
  res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

  return res.status(200).json({
    status: "success",
    data: {
      message: "ایمیل شما با موفقیت تایید شد و وارد حساب خود شدید",
      accessToken,
      user,
    },
  });
};

export const loginController: RequestHandler = async (req, res) => {
  const { accessToken, refreshToken, user } = await authService.login(req.body);

  res.cookie("accessToken", accessToken, ACCESS_COOKIE_OPTIONS);
  res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

  return res.status(200).json({
    status: "success",
    data: {
      message: "ورود با موفقیت انجام شد",
      accessToken,
      user,
    },
  });
};

export const refreshController: RequestHandler = async (req, res, next) => {
  const token = req.cookies?.refreshToken;

  if (!token) {
    return next(new AppError("توکن نوسازی یافت نشد", 401));
  }

  const { accessToken, refreshToken } = await authService.refresh(token);

  res.cookie("accessToken", accessToken, ACCESS_COOKIE_OPTIONS);
  res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

  return res.status(200).json({
    status: "success",
    data: {
      message: "توکن شما با موفقیت تمدید شد",
      accessToken,
    },
  });
};

export const logoutController: RequestHandler = async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (token) {
    await authService.logout(token);
  }

  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  return res.status(200).json({
    status: "success",
    data: {
      message: "خروج با موفقیت انجام شد",
    },
  });
};
