import { Router } from "express";
import { authentication } from "../../middlewares/authentication.js";
import { authorize } from "../../middlewares/authorization.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  getAdminCommentStatsController,
  getAdminCourseStatsController,
  getAdminDiscountStatsController,
  getAdminEnrollmentStatsController,
  getAdminOrderStatsController,
  getAdminOverviewController,
  getAdminPostStatsController,
  getAdminRevenueStatsController,
  getAdminUserStatsController,
} from "./overview.controller.js";

const router = Router();

router.get(
  "/admin",
  authentication,
  authorize("ADMIN"),
  asyncHandler(getAdminOverviewController),
);

router.get(
  "/admin/users",
  authentication,
  authorize("ADMIN"),
  asyncHandler(getAdminUserStatsController),
);

router.get(
  "/admin/courses",
  authentication,
  authorize("ADMIN"),
  asyncHandler(getAdminCourseStatsController),
);

router.get(
  "/admin/orders",
  authentication,
  authorize("ADMIN"),
  asyncHandler(getAdminOrderStatsController),
);

router.get(
  "/admin/revenue",
  authentication,
  authorize("ADMIN"),
  asyncHandler(getAdminRevenueStatsController),
);

router.get(
  "/admin/discounts",
  authentication,
  authorize("ADMIN"),
  asyncHandler(getAdminDiscountStatsController),
);

router.get(
  "/admin/comments",
  authentication,
  authorize("ADMIN"),
  asyncHandler(getAdminCommentStatsController),
);

router.get(
  "/admin/posts",
  authentication,
  authorize("ADMIN"),
  asyncHandler(getAdminPostStatsController),
);

router.get(
  "/admin/enrollments",
  authentication,
  authorize("ADMIN"),
  asyncHandler(getAdminEnrollmentStatsController),
);

export default router;
