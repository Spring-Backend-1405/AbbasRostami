import type { NextFunction, Request, Response } from "express";
import fs from "fs";
import { ZodError, ZodSchema } from "zod";
import { AppError } from "../utils/AppError.js";

export const validate = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = (await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      })) as {
        body?: unknown;
        query?: unknown;
        params?: unknown;
      };

      if (parsed.body !== undefined) req.body = parsed.body;
      if (parsed.params !== undefined) {
        Object.assign(req.params, parsed.params);
      }

      return next();
    } catch (error) {
      if (req.file) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.error("❌ خطا در حذف فایل هرز:", err);
        });
      }

      if (error instanceof ZodError) {
        const formattedErrors: Record<string, string> = {};

        error.issues.forEach((issue) => {
          const rawField = issue.path[1] ?? issue.path[0];
          if (rawField !== undefined) {
            const fieldName = String(rawField);
            formattedErrors[fieldName] = issue.message;
          }
        });

        return next(
          new AppError(
            "خطا در اعتبارسنجی داده‌های ورودی",
            400,
            formattedErrors,
          ),
        );
      }

      return next(error);
    }
  };
};
