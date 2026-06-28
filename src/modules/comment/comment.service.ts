import { CommentStatus, Prisma } from "../../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import {
  buildPaginationMeta,
  parsePagination,
} from "../../utils/pagination.js";
import { getReactionCountsForList } from "../../utils/reactionHelper.js";
import {
  CommentMetaWithStats,
  CommentTreeNode,
  CommentWithMeta,
  CommentWithStats,
  CommentWithUser,
  commentAdminInclude,
  commentBaseInclude,
} from "./comment.types.js";
import {
  CreateCommentInput,
  ListAdminCommentsQuery,
  ListCourseCommentsQuery,
  ListMyCommentsQuery,
  ListPostCommentsQuery,
} from "./comment.validator.js";

const formatComment = (comment: CommentWithUser): CommentWithStats => {
  const { _count, ...rest } = comment;
  return { ...rest, stats: _count };
};

const formatAdminComment = (comment: CommentWithMeta): CommentMetaWithStats => {
  const { _count, ...rest } = comment;
  return { ...rest, stats: _count };
};

const formatAdminComments = (
  comments: CommentWithMeta[],
): CommentMetaWithStats[] => comments.map(formatAdminComment);

const buildCommentTree = (comments: CommentWithUser[]): CommentTreeNode[] => {
  const map = new Map<string, CommentTreeNode>();

  for (const comment of comments) {
    const { _count, ...rest } = comment;
    map.set(comment.id, {
      ...rest,
      stats: _count,
      replies: [],
    });
  }

  const roots: CommentTreeNode[] = [];

  for (const comment of comments) {
    const currentNode = map.get(comment.id)!;

    if (!comment.parentId) {
      roots.push(currentNode);
      continue;
    }

    const parentNode = map.get(comment.parentId);

    if (!parentNode) continue;

    parentNode.replies.push(currentNode);
  }

  const syncCounts = (nodes: CommentTreeNode[]): CommentTreeNode[] => {
    return nodes.map((node) => ({
      ...node,
      stats: {
        ...node.stats,
        replies: node.replies.length,
      },
      replies: syncCounts(node.replies),
    }));
  };

  return syncCounts(roots);
};

export const commentService = {
  async createComment(userId: string, data: CreateCommentInput) {
    const { content, courseId, postId, parentId } = data;

    if (courseId) {
      const course = await prisma.course.findFirst({
        where: {
          id: courseId,
          published: true,
          OR: [{ categoryId: null }, { category: { show: true } }],
        },
        select: { id: true },
      });

      if (!course) {
        throw new AppError("دوره مورد نظر یافت نشد", 404);
      }
    }

    if (postId) {
      const post = await prisma.post.findFirst({
        where: {
          id: postId,
          published: true,
          OR: [{ categoryId: null }, { category: { show: true } }],
        },
        select: { id: true },
      });

      if (!post) {
        throw new AppError("پست مورد نظر یافت نشد", 404);
      }
    }

    if (parentId) {
      const parent = await prisma.comment.findUnique({
        where: { id: parentId },
        select: { id: true, courseId: true, postId: true },
      });

      if (!parent) {
        throw new AppError("کامنت والد یافت نشد", 404);
      }

      if (courseId && parent.courseId !== courseId) {
        throw new AppError("parentId متعلق به این دوره نیست", 400);
      }

      if (postId && parent.postId !== postId) {
        throw new AppError("parentId متعلق به این پست نیست", 400);
      }
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        userId,
        courseId: courseId ?? null,
        postId: postId ?? null,
        parentId: parentId ?? null,
        status: "PENDING",
      },
      include: commentBaseInclude,
    });

    return formatComment(comment);
  },

  async getCourseComments(
    slug: string,
    query: ListCourseCommentsQuery,
    userId?: string,
  ) {
    const { skip, take, page, limit } = parsePagination(query);

    const course = await prisma.course.findFirst({
      where: {
        slug,
        published: true,
        OR: [{ categoryId: null }, { category: { show: true } }],
      },
      select: { id: true, title: true, slug: true },
    });

    if (!course) {
      throw new AppError("دوره مورد نظر یافت نشد", 404);
    }

    const flatComments = await prisma.comment.findMany({
      where: {
        courseId: course.id,
        status: "APPROVED",
      },
      include: commentBaseInclude,
      orderBy: { createdAt: "asc" },
    });

    const tree = buildCommentTree(flatComments);

    const commentIds = flatComments.map((c) => c.id);
    const reactionMap = await getReactionCountsForList(
      "commentId",
      commentIds,
      userId,
    );

    const addReactionsToTree = (
      nodes: CommentTreeNode[],
    ): (CommentTreeNode & { reactions: any })[] => {
      return nodes.map((node) => ({
        ...node,
        reactions: reactionMap.get(node.id) ?? {
          likes: 0,
          dislikes: 0,
          myReaction: null,
        },
        replies: addReactionsToTree(node.replies),
      }));
    };

    const totalRootComments = tree.length;
    const paginatedItems = tree.slice(skip, skip + take);
    const itemsWithReactions = addReactionsToTree(paginatedItems);

    return {
      course,
      items: itemsWithReactions,
      pagination: buildPaginationMeta(totalRootComments, page, limit),
    };
  },

  async getPostComments(
    slug: string,
    query: ListPostCommentsQuery,
    userId?: string,
  ) {
    const { skip, take, page, limit } = parsePagination(query);

    const post = await prisma.post.findFirst({
      where: {
        slug,
        published: true,
        OR: [{ categoryId: null }, { category: { show: true } }],
      },
      select: { id: true, title: true, slug: true },
    });

    if (!post) {
      throw new AppError("پست مورد نظر یافت نشد", 404);
    }

    const flatComments = await prisma.comment.findMany({
      where: {
        postId: post.id,
        status: "APPROVED",
      },
      include: commentBaseInclude,
      orderBy: { createdAt: "asc" },
    });

    const tree = buildCommentTree(flatComments);

    const commentIds = flatComments.map((c) => c.id);
    const reactionMap = await getReactionCountsForList(
      "commentId",
      commentIds,
      userId,
    );

    const addReactionsToTree = (
      nodes: CommentTreeNode[],
    ): (CommentTreeNode & { reactions: any })[] => {
      return nodes.map((node) => ({
        ...node,
        reactions: reactionMap.get(node.id) ?? {
          likes: 0,
          dislikes: 0,
          myReaction: null,
        },
        replies: addReactionsToTree(node.replies),
      }));
    };

    const totalRootComments = tree.length;
    const paginatedItems = tree.slice(skip, skip + take);
    const itemsWithReactions = addReactionsToTree(paginatedItems);

    return {
      post,
      items: itemsWithReactions,
      pagination: buildPaginationMeta(totalRootComments, page, limit),
    };
  },

  async getMyComments(userId: string, query: ListMyCommentsQuery) {
    const { skip, take, page, limit } = parsePagination(query);

    const where: Prisma.CommentWhereInput = { userId };

    if (query.status) {
      where.status = query.status as CommentStatus;
    }

    const [items, total] = await Promise.all([
      prisma.comment.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: commentAdminInclude,
      }),
      prisma.comment.count({ where }),
    ]);

    return {
      items: formatAdminComments(items),
      pagination: buildPaginationMeta(total, page, limit),
    };
  },

  async getAdminComments(query: ListAdminCommentsQuery) {
    const { skip, take, page, limit } = parsePagination(query);

    const where: Prisma.CommentWhereInput = {};

    if (query.status) where.status = query.status as CommentStatus;

    if (query.search) {
      where.content = {
        contains: query.search,
        mode: "insensitive",
      };
    }

    const [items, total] = await Promise.all([
      prisma.comment.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: commentAdminInclude,
      }),
      prisma.comment.count({ where }),
    ]);

    return {
      items: formatAdminComments(items),
      pagination: buildPaginationMeta(total, page, limit),
    };
  },

  async changeStatus(id: string, status: CommentStatus) {
    const comment = await prisma.comment.findUnique({
      where: { id },
    });

    if (!comment) {
      throw new AppError("کامنت مورد نظر یافت نشد", 404);
    }

    if (comment.status === status) {
      const msg =
        status === "APPROVED"
          ? "این کامنت قبلاً تأیید شده است"
          : "این کامنت قبلاً رد شده است";

      throw new AppError(msg, 409);
    }

    const updated = await prisma.comment.update({
      where: { id },
      data: { status },
      include: commentAdminInclude,
    });

    return formatAdminComment(updated);
  },

  async deleteComment(commentId: string, userId: string, isAdmin: boolean) {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { id: true, userId: true },
    });

    if (!comment) {
      throw new AppError("کامنت مورد نظر یافت نشد", 404);
    }

    if (!isAdmin && comment.userId !== userId) {
      throw new AppError("شما اجازه حذف این کامنت را ندارید", 403);
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });
  },
};
