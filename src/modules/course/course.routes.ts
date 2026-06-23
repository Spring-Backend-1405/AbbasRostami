import { Router } from "express";
import { uploadCourseImage } from "../../config/multer.config.js";
import { authentication } from "../../middlewares/authentication.js";
import { authorize } from "../../middlewares/authorization.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  createCourseController,
  deleteCourseController,
  getAdminCoursesController,
  getCourseBySlugController,
  getPublicCoursesController,
  togglePublishController,
  updateCourseController,
} from "./course.controller.js";
import {
  createCourseSchema,
  deleteCourseSchema,
  getCourseBySlugSchema,
  listCoursesAdminSchema,
  listCoursesPublicSchema,
  togglePublishSchema,
  updateCourseSchema,
} from "./course.validator.js";

const router = Router();

router.get(
  "/admin",
  authentication,
  authorize("ADMIN"),
  validate(listCoursesAdminSchema),
  asyncHandler(getAdminCoursesController),
);

router.patch(
  "/:id/publish",
  authentication,
  authorize("ADMIN"),
  validate(togglePublishSchema),
  asyncHandler(togglePublishController),
);

router.post(
  "/",
  authentication,
  authorize("ADMIN"),
  uploadCourseImage,
  validate(createCourseSchema),
  asyncHandler(createCourseController),
);

router.put(
  "/:id",
  authentication,
  authorize("ADMIN"),
  uploadCourseImage,
  validate(updateCourseSchema),
  asyncHandler(updateCourseController),
);

router.delete(
  "/:id",
  authentication,
  authorize("ADMIN"),
  validate(deleteCourseSchema),
  asyncHandler(deleteCourseController),
);

router.get(
  "/",
  validate(listCoursesPublicSchema),
  asyncHandler(getPublicCoursesController),
);

router.get(
  "/:slug",
  validate(getCourseBySlugSchema),
  asyncHandler(getCourseBySlugController),
);

export default router;
