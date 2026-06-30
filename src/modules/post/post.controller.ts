import { RequestHandler } from "express";
import { getUserIdFromRequest } from "../../utils/getUserIdFromRequest.js";
import { postService } from "./post.service.js";
import { ListPostsAdminQuery, ListPostsPublicQuery } from "./post.validator.js";

export const createPostController: RequestHandler = async (req, res) => {
  let imageUrl: string | undefined;
  if (req.file) {
    imageUrl = req.file.path;
  }

  const post = await postService.createPost({
    ...req.body,
    imageUrl,
  });

  return res.status(201).json({
    status: "success",
    data: {
      message: "پست با موفقیت ایجاد شد",
      post,
    },
  });
};

export const updatePostController: RequestHandler = async (req, res) => {
  const id = req.params.id as string;

  let imageUrl: string | undefined;
  if (req.file) {
    imageUrl = req.file.path;
  }

  const post = await postService.updatePost(id, {
    ...req.body,
    imageUrl,
  });

  return res.status(200).json({
    status: "success",
    data: {
      message: "پست با موفقیت ویرایش شد",
      post,
    },
  });
};

export const togglePublishPostController: RequestHandler = async (req, res) => {
  const id = req.params.id as string;
  const { published } = req.body;

  const post = await postService.togglePublish(id, published);

  return res.status(200).json({
    status: "success",
    data: {
      message: published ? "پست با موفقیت منتشر شد" : "پست با موفقیت پنهان شد",
      post,
    },
  });
};

export const deletePostController: RequestHandler = async (req, res) => {
  const id = req.params.id as string;
  await postService.deletePost(id);

  return res.status(200).json({
    status: "success",
    data: {
      message: "پست با موفقیت حذف شد",
    },
  });
};

export const getAdminPostsController: RequestHandler = async (req, res) => {
  const result = await postService.getAdminPosts(
    req.query as ListPostsAdminQuery,
  );

  return res.status(200).json({
    status: "success",
    data: result,
  });
};

export const getPublicPostsController: RequestHandler = async (req, res) => {
  const userId = getUserIdFromRequest(req);

  const result = await postService.getPublicPosts(
    req.query as ListPostsPublicQuery,
    userId,
  );

  return res.status(200).json({
    status: "success",
    data: result,
  });
};

export const getPostBySlugController: RequestHandler = async (req, res) => {
  const slug = req.params.slug as string;
  const userId = getUserIdFromRequest(req);

  const post = await postService.getPostBySlug(slug, userId);

  return res.status(200).json({
    status: "success",
    data: { post },
  });
};
