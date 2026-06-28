import { RequestHandler } from "express";
import { CommentStatus } from "../../../generated/prisma/client.js";
import { getUserIdFromRequest } from "../../utils/getUserIdFromRequest.js";
import { commentService } from "./comment.service.js";
import {
  CreateCommentInput,
  ListAdminCommentsQuery,
  ListCourseCommentsQuery,
  ListMyCommentsQuery,
  ListPostCommentsQuery,
} from "./comment.validator.js";

export const createCommentController: RequestHandler = async (req, res) => {
  const userId = req.user!.id;
  const body = req.body as CreateCommentInput;

  const comment = await commentService.createComment(userId, body);

  return res.status(201).json({
    status: "success",
    data: {
      message: "کامنت با موفقیت ثبت شد و در انتظار تأیید است",
      comment,
    },
  });
};

export const getCourseCommentsController: RequestHandler = async (req, res) => {
  const slug = req.params.slug as string;
  const userId = getUserIdFromRequest(req);

  const result = await commentService.getCourseComments(
    slug,
    req.query as ListCourseCommentsQuery,
    userId,
  );

  return res.status(200).json({
    status: "success",
    data: result,
  });
};

export const getPostCommentsController: RequestHandler = async (req, res) => {
  const slug = req.params.slug as string;
  const userId = getUserIdFromRequest(req);

  const result = await commentService.getPostComments(
    slug,
    req.query as ListPostCommentsQuery,
    userId,
  );

  return res.status(200).json({
    status: "success",
    data: result,
  });
};

export const getMyCommentsController: RequestHandler = async (req, res) => {
  const userId = req.user!.id;

  const result = await commentService.getMyComments(
    userId,
    req.query as ListMyCommentsQuery,
  );

  return res.status(200).json({
    status: "success",
    data: result,
  });
};

export const getAdminCommentsController: RequestHandler = async (req, res) => {
  const result = await commentService.getAdminComments(
    req.query as ListAdminCommentsQuery,
  );

  return res.status(200).json({
    status: "success",
    data: result,
  });
};

export const approveCommentController: RequestHandler = async (req, res) => {
  const id = req.params.id as string;

  const comment = await commentService.changeStatus(id, CommentStatus.APPROVED);

  return res.status(200).json({
    status: "success",
    data: {
      message: "کامنت با موفقیت تأیید شد",
      comment,
    },
  });
};

export const rejectCommentController: RequestHandler = async (req, res) => {
  const id = req.params.id as string;

  const comment = await commentService.changeStatus(id, CommentStatus.REJECTED);

  return res.status(200).json({
    status: "success",
    data: {
      message: "کامنت با موفقیت رد شد",
      comment,
    },
  });
};

export const deleteCommentController: RequestHandler = async (req, res) => {
  const commentId = req.params.id as string;
  const userId = req.user!.id;
  const isAdmin = req.user!.role === "ADMIN";

  await commentService.deleteComment(commentId, userId, isAdmin);

  return res.status(200).json({
    status: "success",
    data: {
      message: "کامنت با موفقیت حذف شد",
    },
  });
};
