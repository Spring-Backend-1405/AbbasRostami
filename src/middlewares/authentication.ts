import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import { TokenPayload } from "../modules/auth/auth.types.js";
import { AppError } from "../utils/AppError.js";
import { verifyAccessToken } from "../utils/jwt.js";

export const authentication = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let accessToken = req.cookies?.accessToken;

  if (!accessToken && req.headers.authorization?.startsWith("Bearer ")) {
    accessToken = req.headers.authorization.split(" ")[1];
  }

  if (!accessToken) {
    return next(new AppError("توکن شما معتبر نیست، لطفا ابتدا وارد شوید", 401));
  }

  let decoded: TokenPayload;
  try {
    decoded = verifyAccessToken(accessToken) as TokenPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(new AppError("توکن منقضی شده است. مجدداً وارد شوید", 401));
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new AppError("توکن نامعتبر است. مجدداً وارد شوید", 401));
    }
    return next(error);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true },
    });

    if (!user) {
      return next(new AppError("کاربر یافت نشد", 401));
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    return next();
  } catch (error) {
    return next(error);
  }
};
