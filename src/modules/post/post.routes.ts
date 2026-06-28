import { Router } from "express";
import { uploadPostImage } from "../../config/multer.js";
import { authentication } from "../../middlewares/authentication.js";
import { authorize } from "../../middlewares/authorization.js";
import { validate } from "../../middlewares/validate.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { togglePostReaction } from "../reaction/reaction.controller.js";
import { toggleReactionSchema } from "../reaction/reaction.validator.js";
import {
  createPostController,
  deletePostController,
  getAdminPostsController,
  getPostBySlugController,
  getPublicPostsController,
  togglePublishPostController,
  updatePostController,
} from "./post.controller.js";
import {
  createPostSchema,
  deletePostSchema,
  getPostBySlugSchema,
  listPostsAdminSchema,
  listPostsPublicSchema,
  togglePublishPostSchema,
  updatePostSchema,
} from "./post.validator.js";

const router = Router();

// ─── Admin mutations

router.get(
  "/admin",
  authentication,
  authorize("ADMIN"),
  validate(listPostsAdminSchema),
  asyncHandler(getAdminPostsController),
);

router.post(
  "/",
  authentication,
  authorize("ADMIN"),
  uploadPostImage,
  validate(createPostSchema),
  asyncHandler(createPostController),
);

router.put(
  "/:id",
  authentication,
  authorize("ADMIN"),
  uploadPostImage,
  validate(updatePostSchema),
  asyncHandler(updatePostController),
);

router.patch(
  "/:id/publish",
  authentication,
  authorize("ADMIN"),
  validate(togglePublishPostSchema),
  asyncHandler(togglePublishPostController),
);

router.delete(
  "/:id",
  authentication,
  authorize("ADMIN"),
  validate(deletePostSchema),
  asyncHandler(deletePostController),
);

// ─── Public routes
router.get(
  "/",
  validate(listPostsPublicSchema),
  asyncHandler(getPublicPostsController),
);

router.get(
  "/:slug",
  validate(getPostBySlugSchema),
  asyncHandler(getPostBySlugController),
);

// ─── User routes
router.post(
  "/:id/reaction",
  authentication,
  validate(toggleReactionSchema),
  asyncHandler(togglePostReaction),
);

export default router;
