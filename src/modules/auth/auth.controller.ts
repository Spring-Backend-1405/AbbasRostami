import { RequestHandler } from "express";
import { AppError } from "../../utils/AppError.js";
import { authService } from "./auth.service.js";

const ACCESS_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "none" as const,
  path: "/",
  maxAge: 15 * 60 * 1000,
};

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "none" as const,
  path: "/api/auth",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const CLEAR_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: true,
  sameSite: "none" as const,
  path: "/",
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
  const token = req.cookies?.refreshToken || req.body?.refreshToken;

  if (!token) {
    return next(new AppError("توکن نوسازی یافت نشد", 401));
  }

  const { accessToken, refreshToken } = await authService.refresh(token);

  res.cookie("accessToken", accessToken, ACCESS_COOKIE_OPTIONS);
  res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

  return res.status(200).json({
    status: "success",
    data: {
      message: "تمدید موفق",
      accessToken,
    },
  });
};

export const logoutController: RequestHandler = async (req, res) => {
  const token =
    req.cookies?.refreshToken ??
    (req.headers["x-refresh-token"] as string | undefined) ??
    req.body?.refreshToken ??
    null;

  if (token) {
    await authService.logout(token);
  }

  res.clearCookie("accessToken", CLEAR_COOKIE_OPTIONS);
  res.clearCookie("refreshToken", CLEAR_COOKIE_OPTIONS);

  return res.status(200).json({
    status: "success",
    data: {
      message: "خروج با موفقیت انجام شد",
    },
  });
};

export const forgotPasswordController: RequestHandler = async (req, res) => {
  const result = await authService.forgotPassword(req.body);

  return res.status(200).json({
    status: "success",
    data: result,
  });
};

export const resetPasswordController: RequestHandler = async (req, res) => {
  const result = await authService.resetPassword(req.body);

  res.clearCookie("accessToken", CLEAR_COOKIE_OPTIONS);
  res.clearCookie("refreshToken", CLEAR_COOKIE_OPTIONS);

  return res.status(200).json({
    status: "success",
    data: result,
  });
};

export const resendVerificationController: RequestHandler = async (
  req,
  res,
) => {
  const result = await authService.resendVerification(req.body);

  return res.status(200).json({
    status: "success",
    data: result,
  });
};

export const resendResetCodeController: RequestHandler = async (req, res) => {
  const result = await authService.resendResetCode(req.body);

  return res.status(200).json({
    status: "success",
    data: result,
  });
};

export const changePasswordController: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const result = await authService.changePassword(userId, req.body);

  res.clearCookie("accessToken", CLEAR_COOKIE_OPTIONS);
  res.clearCookie("refreshToken", CLEAR_COOKIE_OPTIONS);

  return res.status(200).json({
    status: "success",
    data: result,
  });
};

export const requestChangeEmailController: RequestHandler = async (
  req,
  res,
) => {
  const userId = req.user!.id;
  const result = await authService.requestChangeEmail(userId, req.body);

  return res.status(200).json({
    status: "success",
    data: result,
  });
};

export const verifyChangeEmailController: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const result = await authService.verifyChangeEmail(userId, req.body);

  res.clearCookie("accessToken", CLEAR_COOKIE_OPTIONS);
  res.clearCookie("refreshToken", CLEAR_COOKIE_OPTIONS);

  return res.status(200).json({
    status: "success",
    data: result,
  });
};

export const resendChangeEmailCodeController: RequestHandler = async (
  req,
  res,
) => {
  const userId = req.user!.id;
  const result = await authService.resendChangeEmailCode(userId);

  return res.status(200).json({
    status: "success",
    data: result,
  });
};
