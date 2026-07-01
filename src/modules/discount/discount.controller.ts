import { RequestHandler } from "express";
import { discountService } from "./discount.service.js";
import {
  ApplyDiscountInput,
  ListDiscountsQuery,
} from "./discount.validator.js";

export const createDiscountController: RequestHandler = async (req, res) => {
  await discountService.createDiscount(req.body);

  return res.status(201).json({
    status: "success",
    data: {
      message: "کد تخفیف با موفقیت ایجاد شد",
    },
  });
};

export const listDiscountsController: RequestHandler = async (req, res) => {
  const result = await discountService.listDiscounts(
    req.query as ListDiscountsQuery,
  );

  return res.status(200).json({
    status: "success",
    data: result,
  });
};

export const toggleDiscountController: RequestHandler = async (req, res) => {
  const id = req.params.id as string;
  const discount = await discountService.toggleDiscount(id);

  return res.status(200).json({
    status: "success",
    data: {
      message: discount.active ? "کد تخفیف فعال شد" : "کد تخفیف غیرفعال شد",
    },
  });
};

export const deleteDiscountController: RequestHandler = async (req, res) => {
  const id = req.params.id as string;
  await discountService.deleteDiscount(id);

  return res.status(200).json({
    status: "success",
    data: { message: "کد تخفیف با موفقیت حذف شد" },
  });
};

export const applyDiscountController: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const result = await discountService.applyDiscountToCart(
    userId,
    req.body as ApplyDiscountInput,
  );

  return res.status(200).json({
    status: "success",
    data: result,
  });
};

export const removeDiscountController: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const result = await discountService.removeDiscountFromCart(userId);

  return res.status(200).json({
    status: "success",
    data: result,
  });
};
