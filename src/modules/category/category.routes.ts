import { Router } from "express";
import { authentication } from "../../middlewares/authentication.js";
import { authorize } from "../../middlewares/authorization.js";
import { validate } from "../../middlewares/validate.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  createCategoryController,
  deleteCategoryController,
  getAdminCategoriesController,
  getCategoryBySlugController,
  getPublicCategoriesController,
  toggleVisibilityController,
  updateCategoryController,
} from "./category.controller.js";
import {
  createCategorySchema,
  deleteCategorySchema,
  getCategoryBySlugSchema,
  listCategoriesAdminSchema,
  toggleVisibilitySchema,
  updateCategorySchema,
} from "./category.validator.js";

const router = Router();

router.get(
  "/admin",
  authentication,
  authorize("ADMIN"),
  validate(listCategoriesAdminSchema),
  asyncHandler(getAdminCategoriesController),
);

router.patch(
  "/:id/visibility",
  authentication,
  authorize("ADMIN"),
  validate(toggleVisibilitySchema),
  asyncHandler(toggleVisibilityController),
);

router.post(
  "/",
  authentication,
  authorize("ADMIN"),
  validate(createCategorySchema),
  asyncHandler(createCategoryController),
);

router.put(
  "/:id",
  authentication,
  authorize("ADMIN"),
  validate(updateCategorySchema),
  asyncHandler(updateCategoryController),
);

router.delete(
  "/:id",
  authentication,
  authorize("ADMIN"),
  validate(deleteCategorySchema),
  asyncHandler(deleteCategoryController),
);

router.get("/", asyncHandler(getPublicCategoriesController));

router.get(
  "/:slug",
  validate(getCategoryBySlugSchema),
  asyncHandler(getCategoryBySlugController),
);

export default router;
