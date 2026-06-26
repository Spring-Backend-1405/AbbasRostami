import { prisma } from "../lib/prisma.js";

export interface ReactionCounts {
  likes: number;
  dislikes: number;
}

export interface ReactionState extends ReactionCounts {
  myReaction: "LIKE" | "DISLIKE" | null;
}

export const getReactionCounts = async (
  field: "courseId" | "commentId" | "postId",
  targetId: string,
): Promise<ReactionCounts> => {
  const [likes, dislikes] = await Promise.all([
    prisma.reaction.count({
      where: { [field]: targetId, type: "LIKE" },
    }),
    prisma.reaction.count({
      where: { [field]: targetId, type: "DISLIKE" },
    }),
  ]);

  return { likes, dislikes };
};

export const getMyReaction = async (
  field: "courseId" | "commentId" | "postId",
  targetId: string,
  userId?: string,
): Promise<"LIKE" | "DISLIKE" | null> => {
  if (!userId) return null;

  const reaction = await prisma.reaction.findFirst({
    where: { [field]: targetId, userId },
    select: { type: true },
  });

  return (reaction?.type as "LIKE" | "DISLIKE") ?? null;
};

export const getReactionCountsForList = async (
  field: "courseId" | "commentId" | "postId",
  targetIds: string[],
  userId?: string,
): Promise<Map<string, ReactionState>> => {
  if (targetIds.length === 0) {
    return new Map();
  }

  const counts = await prisma.reaction.groupBy({
    by: [field, "type"],
    where: { [field]: { in: targetIds } },
    _count: true,
  });

  const userReactionMap = new Map<string, "LIKE" | "DISLIKE">();

  if (userId) {
    if (field === "courseId") {
      const userReactions = await prisma.reaction.findMany({
        where: {
          courseId: { in: targetIds },
          userId,
        },
        select: {
          courseId: true,
          type: true,
        },
      });

      for (const reaction of userReactions) {
        if (reaction.courseId) {
          userReactionMap.set(
            reaction.courseId,
            reaction.type as "LIKE" | "DISLIKE",
          );
        }
      }
    }

    if (field === "commentId") {
      const userReactions = await prisma.reaction.findMany({
        where: {
          commentId: { in: targetIds },
          userId,
        },
        select: {
          commentId: true,
          type: true,
        },
      });

      for (const reaction of userReactions) {
        if (reaction.commentId) {
          userReactionMap.set(
            reaction.commentId,
            reaction.type as "LIKE" | "DISLIKE",
          );
        }
      }
    }

    if (field === "postId") {
      const userReactions = await prisma.reaction.findMany({
        where: {
          postId: { in: targetIds },
          userId,
        },
        select: {
          postId: true,
          type: true,
        },
      });

      for (const reaction of userReactions) {
        if (reaction.postId) {
          userReactionMap.set(
            reaction.postId,
            reaction.type as "LIKE" | "DISLIKE",
          );
        }
      }
    }
  }

  const resultMap = new Map<string, ReactionState>();

  for (const id of targetIds) {
    resultMap.set(id, {
      likes: 0,
      dislikes: 0,
      myReaction: userReactionMap.get(id) ?? null,
    });
  }

  for (const row of counts) {
    const id = row[field] as string | null;
    if (!id) continue;

    const entry = resultMap.get(id);
    if (!entry) continue;

    if (row.type === "LIKE") {
      entry.likes = row._count;
    } else {
      entry.dislikes = row._count;
    }
  }

  return resultMap;
};
