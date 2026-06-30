import { RequestHandler } from "express";
import { getUserIdFromRequest } from "../../utils/getUserIdFromRequest.js";
import { courseService } from "./course.service.js";
import {
  ListCoursesAdminQuery,
  ListCoursesPublicQuery,
} from "./course.validator.js";

export const createCourseController: RequestHandler = async (req, res) => {
  let imageUrl: string | undefined = undefined;
  if (req.file) {
    imageUrl = req.file.path;
  }

  const course = await courseService.createCourse({
    ...req.body,
    imageUrl,
  });

  return res.status(201).json({
    status: "success",
    data: {
      message: "دوره با موفقیت ایجاد شد",
      course,
    },
  });
};

export const updateCourseController: RequestHandler = async (req, res) => {
  const id = req.params.id as string;

  let imageUrl: string | undefined = undefined;
  if (req.file) {
    imageUrl = req.file.path;
  }

  const course = await courseService.updateCourse(id, {
    ...req.body,
    imageUrl,
  });

  return res.status(200).json({
    status: "success",
    data: {
      message: "دوره با موفقیت ویرایش شد",
      course,
    },
  });
};

export const togglePublishController: RequestHandler = async (req, res) => {
  const id = req.params.id as string;
  const { published } = req.body;

  const course = await courseService.togglePublish(id, published);

  return res.status(200).json({
    status: "success",
    data: {
      message: published
        ? "دوره با موفقیت منتشر شد"
        : "دوره با موفقیت پنهان شد",
      course,
    },
  });
};

export const deleteCourseController: RequestHandler = async (req, res) => {
  const id = req.params.id as string;
  await courseService.deleteCourse(id);

  return res.status(200).json({
    status: "success",
    data: {
      message: "دوره با موفقیت حذف شد",
    },
  });
};

export const getPublicCoursesController: RequestHandler = async (req, res) => {
  const userId = getUserIdFromRequest(req);

  const result = await courseService.getPublicCourses(
    req.query as ListCoursesPublicQuery,
    userId,
  );

  return res.status(200).json({
    status: "success",
    data: result,
  });
};

export const getAdminCoursesController: RequestHandler = async (req, res) => {
  const result = await courseService.getAdminCourses(
    req.query as ListCoursesAdminQuery,
  );

  return res.status(200).json({
    status: "success",
    data: result,
  });
};

export const getCourseBySlugController: RequestHandler = async (req, res) => {
  const slug = req.params.slug as string;
  const userId = getUserIdFromRequest(req);

  const course = await courseService.getCourseBySlug(slug, userId);

  return res.status(200).json({
    status: "success",
    data: { course },
  });
};
