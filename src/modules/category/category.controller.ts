import { RequestHandler } from "express";
import { categoryService } from "./category.service.js";
import { ListCategoriesAdminQuery } from "./category.validator.js";

export const createCategoryController: RequestHandler = async (req, res) => {
  const category = await categoryService.createCategory(req.body);

  return res.status(201).json({
    status: "success",
    data: {
      message: "دسته بندی با موفقیت ایجاد شد",
      category,
    },
  });
};

export const getPublicCategoriesController: RequestHandler = async (
  req,
  res,
) => {
  const categories = await categoryService.getPublicCategories();

  return res.status(200).json({
    status: "success",
    data: {
      categories,
      total: categories.length,
    },
  });
};

export const getAdminCategoriesController: RequestHandler = async (
  req,
  res,
) => {
  const result = await categoryService.getAdminCategories(
    req.query as ListCategoriesAdminQuery,
  );

  return res.status(200).json({
    status: "success",
    data: result,
  });
};

export const getCategoryBySlugController: RequestHandler = async (req, res) => {
  const slug = req.params.slug as string;
  const category = await categoryService.getCategoryBySlug(slug);

  return res.status(200).json({
    status: "success",
    data: { category },
  });
};

export const updateCategoryController: RequestHandler = async (req, res) => {
  const id = req.params.id as string;
  const category = await categoryService.updateCategory(id, req.body);

  return res.status(200).json({
    status: "success",
    data: {
      message: "دسته بندی با موفقیت ویرایش شد",
      category,
    },
  });
};

export const toggleVisibilityController: RequestHandler = async (req, res) => {
  const id = req.params.id as string;
  const { show } = req.body;

  const category = await categoryService.toggleVisibility(id, show);

  return res.status(200).json({
    status: "success",
    data: {
      message: show
        ? "دسته بندی با موفقیت فعال شد. برای انتشار دوره‌ها، آن‌ها را به صورت جداگانه فعالسازی کنید."
        : "دسته بندی با موفقیت غیرفعال شد. دوره‌ها و پست‌های وابسته نیز غیرفعال شدند.",
      category,
    },
  });
};

export const deleteCategoryController: RequestHandler = async (req, res) => {
  const id = req.params.id as string;
  await categoryService.deleteCategory(id);

  return res.status(200).json({
    status: "success",
    data: {
      message: "دسته بندی با موفقیت حذف شد",
    },
  });
};
