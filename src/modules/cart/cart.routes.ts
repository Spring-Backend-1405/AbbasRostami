import { Router } from "express";
import { authentication } from "../../middlewares/authentication.js";
import { validate } from "../../middlewares/validate.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  applyDiscountController,
  removeDiscountController,
} from "../discount/discount.controller.js";
import { applyDiscountSchema } from "../discount/discount.validator.js";
import {
  addToCartController,
  clearCartController,
  getCartController,
  removeFromCartController,
} from "./cart.controller.js";
import { addToCartSchema, removeFromCartSchema } from "./cart.validator.js";

const router = Router();

router.use(authentication);

// ─── Cart
router.get("/", asyncHandler(getCartController));

router.post(
  "/items",
  validate(addToCartSchema),
  asyncHandler(addToCartController),
);

router.delete(
  "/items/:courseId",
  validate(removeFromCartSchema),
  asyncHandler(removeFromCartController),
);

router.delete("/", asyncHandler(clearCartController));

// ─── Discount
router.post(
  "/apply-discount",
  validate(applyDiscountSchema),
  asyncHandler(applyDiscountController),
);

router.delete("/discount", asyncHandler(removeDiscountController));

export default router;
