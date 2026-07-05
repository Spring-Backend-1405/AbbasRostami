import { Router } from "express";
import { authentication } from "../../middlewares/authentication.js";
import {
  changeEmailLimiter,
  forgotPasswordLimiter,
  loginLimiter,
  registerIpLimiter,
  registerLimiter,
  resendResetCodeLimiter,
  resendVerificationLimiter,
  resetPasswordLimiter,
} from "../../middlewares/authLimiter.js";
import { validate } from "../../middlewares/validate.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  changePasswordController,
  forgotPasswordController,
  loginController,
  logoutController,
  refreshController,
  registerController,
  requestChangeEmailController,
  resendResetCodeController,
  resendVerificationController,
  resetPasswordController,
  verifyChangeEmailController,
  verifyEmailController,
} from "./auth.controller.js";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  requestChangeEmailSchema,
  resendResetCodeSchema,
  resendVerificationSchema,
  resetPasswordSchema,
  verifyChangeEmailSchema,
  verifyEmailSchema,
} from "./auth.validator.js";

const router = Router();

router.post(
  "/register",
  registerIpLimiter,
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

router.post(
  "/forgot-password",
  forgotPasswordLimiter,
  validate(forgotPasswordSchema),
  asyncHandler(forgotPasswordController),
);

router.post(
  "/reset-password",
  resetPasswordLimiter,
  validate(resetPasswordSchema),
  asyncHandler(resetPasswordController),
);

router.post(
  "/resend-verification",
  resendVerificationLimiter,
  validate(resendVerificationSchema),
  asyncHandler(resendVerificationController),
);

router.post(
  "/resend-reset-code",
  resendResetCodeLimiter,
  validate(resendResetCodeSchema),
  asyncHandler(resendResetCodeController),
);

router.post(
  "/change-password",
  authentication,
  validate(changePasswordSchema),
  asyncHandler(changePasswordController),
);

router.post(
  "/request-change-email",
  authentication,
  changeEmailLimiter,
  validate(requestChangeEmailSchema),
  asyncHandler(requestChangeEmailController),
);

router.post(
  "/verify-change-email",
  authentication,
  validate(verifyChangeEmailSchema),
  asyncHandler(verifyChangeEmailController),
);

export default router;
