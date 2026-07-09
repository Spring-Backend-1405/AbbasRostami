import { Router } from "express";
import { authentication } from "../../middlewares/authentication.js";
import { authorize } from "../../middlewares/authorization.js";
import { validate } from "../../middlewares/validate.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { toggleCommentReaction } from "../reaction/reaction.controller.js";
import { toggleReactionSchema } from "../reaction/reaction.validator.js";
import {
  approveCommentController,
  createCommentController,
  deleteCommentController,
  getAdminCommentsController,
  getCourseCommentsController,
  getMyCommentsController,
  getPostCommentsController,
  rejectCommentController,
} from "./comment.controller.js";
import {
  createCommentSchema,
  deleteCommentSchema,
  listAdminCommentsSchema,
  listCourseCommentsSchema,
  listMyCommentsSchema,
  listPostCommentsSchema,
  moderateCommentSchema,
} from "./comment.validator.js";

const router = Router();

router.get(
  "/course/:slug",
  validate(listCourseCommentsSchema),
  asyncHandler(getCourseCommentsController),
);

router.get(
  "/post/:slug",
  validate(listPostCommentsSchema),
  asyncHandler(getPostCommentsController),
);

router.post(
  "/",
  authentication,
  validate(createCommentSchema),
  asyncHandler(createCommentController),
);

router.get(
  "/my-comments",
  authentication,
  validate(listMyCommentsSchema),
  asyncHandler(getMyCommentsController),
);

router.get(
  "/admin",
  authentication,
  authorize("ADMIN"),
  validate(listAdminCommentsSchema),
  asyncHandler(getAdminCommentsController),
);

router.delete(
  "/:id",
  authentication,
  validate(deleteCommentSchema),
  asyncHandler(deleteCommentController),
);

router.post(
  "/:id/reaction",
  authentication,
  validate(toggleReactionSchema),
  asyncHandler(toggleCommentReaction),
);

router.patch(
  "/:id/approve",
  authentication,
  authorize("ADMIN"),
  validate(moderateCommentSchema),
  asyncHandler(approveCommentController),
);

router.patch(
  "/:id/reject",
  authentication,
  authorize("ADMIN"),
  validate(moderateCommentSchema),
  asyncHandler(rejectCommentController),
);

export default router;
