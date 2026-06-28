import { Router } from "express";
import { authentication } from "../../middlewares/authentication.js";
import { validate } from "../../middlewares/validate.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  getMyCourseFavoritesController,
  getMyPostFavoritesController,
  toggleCourseFavoriteController,
  togglePostFavoriteController,
} from "./favorite.controller.js";
import {
  listFavoritesSchema,
  toggleCourseFavoriteSchema,
  togglePostFavoriteSchema,
} from "./favorite.validator.js";

const router = Router();

router.use(authentication);

// ─── Course Favorites
router.post(
  "/courses/:courseId",
  validate(toggleCourseFavoriteSchema),
  asyncHandler(toggleCourseFavoriteController),
);

router.get(
  "/courses",
  validate(listFavoritesSchema),
  asyncHandler(getMyCourseFavoritesController),
);

// ─── Post Favorites
router.post(
  "/posts/:postId",
  validate(togglePostFavoriteSchema),
  asyncHandler(togglePostFavoriteController),
);

router.get(
  "/posts",
  validate(listFavoritesSchema),
  asyncHandler(getMyPostFavoritesController),
);

export default router;
