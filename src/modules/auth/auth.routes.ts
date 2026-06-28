import { Router } from "express";
import {
  loginLimiter,
  registerLimiter,
} from "../../middlewares/authLimiter.js";
import { validate } from "../../middlewares/validate.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  loginController,
  logoutController,
  refreshController,
  registerController,
  verifyEmailController,
} from "./auth.controller.js";
import {
  loginSchema,
  registerSchema,
  verifyEmailSchema,
} from "./auth.validator.js";

const router = Router();

router.post(
  "/register",
  registerLimiter,
  validate(registerSchema),
  asyncHandler(registerController),
);
router.post(
  "/verify-email",
  validate(verifyEmailSchema),
  asyncHandler(verifyEmailController),
);
router.post(
  "/login",
  loginLimiter,
  validate(loginSchema),
  asyncHandler(loginController),
);
router.post("/refresh", asyncHandler(refreshController));
router.post("/logout", asyncHandler(logoutController));

export default router;
