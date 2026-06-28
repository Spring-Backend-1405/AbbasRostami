import { Router } from "express";
import { authentication } from "../../middlewares/authentication.js";
import { authorize } from "../../middlewares/authorization.js";
import { validate } from "../../middlewares/validate.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import {
  chargeWalletController,
  getAllTransactionsController,
  getAllWalletsController,
  getUserTransactionsController,
  getWalletBalanceController,
  verifyPaymentController,
} from "./wallet.controller.js";
import {
  chargeWalletSchema,
  listAdminTransactionsSchema,
  listUserTransactionsSchema,
  listWalletsAdminSchema,
  verifyPaymentSchema,
} from "./wallet.validator.js";

const router = Router();

router.get(
  "/admin/wallets",
  authentication,
  authorize("ADMIN"),
  validate(listWalletsAdminSchema),
  asyncHandler(getAllWalletsController),
);

router.get(
  "/admin/transactions",
  authentication,
  authorize("ADMIN"),
  validate(listAdminTransactionsSchema),
  asyncHandler(getAllTransactionsController),
);

router.get("/", authentication, asyncHandler(getWalletBalanceController));

router.post(
  "/charge",
  authentication,
  validate(chargeWalletSchema),
  asyncHandler(chargeWalletController),
);

router.get(
  "/verify",
  validate(verifyPaymentSchema),
  asyncHandler(verifyPaymentController),
);

router.get(
  "/transactions",
  authentication,
  validate(listUserTransactionsSchema),
  asyncHandler(getUserTransactionsController),
);

export default router;
