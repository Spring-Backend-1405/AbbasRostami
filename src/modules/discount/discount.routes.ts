import { Router } from "express";
import { authentication } from "../../middlewares/authentication.js";
import { authorize } from "../../middlewares/authorization.js";
import { validate } from "../../middlewares/validate.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  createDiscountController,
  deleteDiscountController,
  listDiscountsController,
  toggleDiscountController,
} from "./discount.controller.js";
import {
  createDiscountSchema,
  deleteDiscountSchema,
  listDiscountsSchema,
  toggleDiscountSchema,
} from "./discount.validator.js";

const router = Router();

router.use(authentication, authorize("ADMIN"));

router.post(
  "/",
  validate(createDiscountSchema),
  asyncHandler(createDiscountController),
);

router.get(
  "/",
  validate(listDiscountsSchema),
  asyncHandler(listDiscountsController),
);

router.patch(
  "/:id/toggle",
  validate(toggleDiscountSchema),
  asyncHandler(toggleDiscountController),
);

router.delete(
  "/:id",
  validate(deleteDiscountSchema),
  asyncHandler(deleteDiscountController),
);

export default router;
