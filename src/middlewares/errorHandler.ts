import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.js";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }
  console.error("Error:", err);
  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
};
