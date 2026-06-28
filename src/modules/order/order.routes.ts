import { Router } from "express";
import { authentication } from "../../middlewares/authentication.js";
import { authorize } from "../../middlewares/authorization.js";
import { validate } from "../../middlewares/validate.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  cancelOrderController,
  checkoutWalletController,
  checkoutZarinpalController,
  getAdminOrderController,
  getAdminOrdersController,
  getMyOrdersController,
  getOrderController,
  verifyOrderController,
} from "./order.controller.js";
import {
  cancelOrderSchema,
  getAdminOrderSchema,
  getOrderSchema,
  listAdminOrdersSchema,
  listOrdersSchema,
} from "./order.validator.js";

const router = Router();

router.get("/verify", asyncHandler(verifyOrderController));

router.use(authentication);

router.get(
  "/admin",
  authorize("ADMIN"),
  validate(listAdminOrdersSchema),
  asyncHandler(getAdminOrdersController),
);

router.get(
  "/admin/:id",
  authorize("ADMIN"),
  validate(getAdminOrderSchema),
  asyncHandler(getAdminOrderController),
);

router.get(
  "/my-orders",
  validate(listOrdersSchema),
  asyncHandler(getMyOrdersController),
);

router.post("/checkout/wallet", asyncHandler(checkoutWalletController));

router.post("/checkout/zarinpal", asyncHandler(checkoutZarinpalController));

router.get("/:id", validate(getOrderSchema), asyncHandler(getOrderController));

router.patch(
  "/:id/cancel",
  validate(cancelOrderSchema),
  asyncHandler(cancelOrderController),
);

export default router;
