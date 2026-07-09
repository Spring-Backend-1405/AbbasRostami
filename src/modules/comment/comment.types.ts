import { Prisma } from "../../../generated/prisma/client.js";

export const commentBaseInclude = {
  user: {
    select: {
      id: true,
      name: true,
      avatar: true,
    },
  },
  _count: {
    select: {
      replies: true,
      reactions: true,
    },
  },
} satisfies Prisma.CommentInclude;

export const commentAdminInclude = {
  user: {
    select: {
      id: true,
      name: true,
      avatar: true,
    },
  },
  parent: {
    select: {
      id: true,
      content: true,
      status: true,
    },
  },
  course: {
    select: {
      id: true,
      title: true,
      slug: true,
    },
  },
  post: {
    select: {
      id: true,
      title: true,
      slug: true,
    },
  },
  _count: {
    select: {
      replies: true,
      reactions: true,
    },
  },
} satisfies Prisma.CommentInclude;

export type CommentWithUser = Prisma.CommentGetPayload<{
  include: typeof commentBaseInclude;
}>;

export type CommentWithMeta = Prisma.CommentGetPayload<{
  include: typeof commentAdminInclude;
}>;

export type CommentWithStats = Omit<CommentWithUser, "_count"> & {
  stats: CommentWithUser["_count"];
};

export type CommentMetaWithStats = Omit<CommentWithMeta, "_count"> & {
  stats: CommentWithMeta["_count"];
};

export type CommentTreeNode = CommentWithStats & {
  replies: CommentTreeNode[];
};

export type CommentReactionState = {
  likes: number;
  dislikes: number;
  myReaction: "LIKE" | "DISLIKE" | null;
};

export type CommentTreeNodeWithReactions = CommentTreeNode & {
  reactions: CommentReactionState;
  replies: CommentTreeNodeWithReactions[];
};
