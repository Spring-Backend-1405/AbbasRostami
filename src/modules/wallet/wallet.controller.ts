import { RequestHandler } from "express";
import { walletService } from "./wallet.service.js";
import {
  ListAdminTransactionsQuery,
  ListUserTransactionsQuery,
  ListWalletsAdminQuery,
} from "./wallet.validator.js";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

export const getWalletBalanceController: RequestHandler = async (req, res) => {
  const userId = req.user!.id;

  const wallet = await walletService.getWalletBalance(userId);

  return res.status(200).json({
    status: "success",
    data: { wallet },
  });
};

export const chargeWalletController: RequestHandler = async (req, res) => {
  const userId = req.user!.id;

  const result = await walletService.chargeWallet(userId, req.body);

  return res.status(200).json({
    status: "success",
    data: {
      message: "لطفاً برای پرداخت به آدرس زیر مراجعه کنید",
      paymentUrl: result.paymentUrl,
      transactionId: result.transaction.id,
      authority: result.authority,
    },
  });
};

export const verifyPaymentController: RequestHandler = async (req, res) => {
  const { Authority, Status } = req.query;

  try {
    const result = await walletService.verifyPayment(
      Authority as string,
      Status as string,
    );

    const params = new URLSearchParams({
      status: "success",
      refId: result.refId || "",
      amount: String(result.transaction.amount),
      newBalance: String(result.newBalance),
      transactionId: result.transaction.id,
    });

    return res.redirect(`${FRONTEND_URL}/payment/success?${params.toString()}`);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "خطا در پرداخت";

    const params = new URLSearchParams({
      status: "failed",
      reason: message,
      authority: (Authority as string) || "",
    });

    return res.redirect(`${FRONTEND_URL}/payment/failed?${params.toString()}`);
  }
};

export const getUserTransactionsController: RequestHandler = async (
  req,
  res,
) => {
  const userId = req.user!.id;

  const result = await walletService.getUserTransactions(
    userId,
    req.query as ListUserTransactionsQuery,
  );

  return res.status(200).json({
    status: "success",
    data: result,
  });
};

export const getAllWalletsController: RequestHandler = async (req, res) => {
  const result = await walletService.getAllWallets(
    req.query as ListWalletsAdminQuery,
  );

  return res.status(200).json({
    status: "success",
    data: result,
  });
};

export const getAllTransactionsController: RequestHandler = async (
  req,
  res,
) => {
  const result = await walletService.getAllTransactions(
    req.query as ListAdminTransactionsQuery,
  );

  return res.status(200).json({
    status: "success",
    data: result,
  });
};
