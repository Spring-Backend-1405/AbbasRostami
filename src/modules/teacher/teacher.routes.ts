import { Router } from "express";
import { uploadTeacherAvatar } from "../../config/multer.js";
import { authentication } from "../../middlewares/authentication.js";
import { authorize } from "../../middlewares/authorization.js";
import { validate } from "../../middlewares/validate.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  createTeacherController,
  deleteTeacherController,
  getTeacherBySlugController,
  getTeachersController,
  updateTeacherController,
} from "./teacher.controller.js";
import {
  createTeacherSchema,
  deleteTeacherSchema,
  getTeacherBySlugSchema,
  listTeachersSchema,
  updateTeacherSchema,
} from "./teacher.validator.js";

const router = Router();

// ─── Admin
router.post(
  "/",
  authentication,
  authorize("ADMIN"),
  uploadTeacherAvatar,
  validate(createTeacherSchema),
  asyncHandler(createTeacherController),
);

router.put(
  "/:id",
  authentication,
  authorize("ADMIN"),
  uploadTeacherAvatar,
  validate(updateTeacherSchema),
  asyncHandler(updateTeacherController),
);

router.delete(
  "/:id",
  authentication,
  authorize("ADMIN"),
  validate(deleteTeacherSchema),
  asyncHandler(deleteTeacherController),
);

// ─── Public
router.get(
  "/",
  validate(listTeachersSchema),
  asyncHandler(getTeachersController),
);

router.get(
  "/:slug",
  validate(getTeacherBySlugSchema),
  asyncHandler(getTeacherBySlugController),
);

export default router;
