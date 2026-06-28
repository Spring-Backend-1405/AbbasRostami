import { Router } from "express";
import { authentication } from "../../middlewares/authentication.js";
import { validate } from "../../middlewares/validate.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  addToCartController,
  clearCartController,
  getCartController,
  removeFromCartController,
} from "./cart.controller.js";
import { addToCartSchema, removeFromCartSchema } from "./cart.validator.js";

const router = Router();

router.use(authentication);

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

export default router;
