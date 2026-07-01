import type { ErrorRequestHandler } from "express";
import { AppError } from "../utils/AppError.js";
import { logger, sendErrorToTelegram } from "./logger.js";

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (err instanceof AppError) {
    if (err.status === "fail") {
      return res.status(err.statusCode).json({
        status: "fail",
        data: err.failData || { message: err.message },
      });
    }

    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
      code: err.statusCode,
    });
  }

  logger.error("💥 Unexpected Error", {
    message: err.message,
    stack: err.stack,
    method: req.method,
    path: req.originalUrl,
  });

  sendErrorToTelegram({
    statusCode: 500,
    method: req.method,
    path: req.originalUrl,
    message: err.message || "Unknown error",
    stack: err.stack,
    userId: req.user?.id,
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  }).catch(() => {});

  return res.status(500).json({
    status: "error",
    message: "خطایی در سمت سرور رخ داده است. لطفاً بعداً تلاش کنید.",
    code: 500,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
