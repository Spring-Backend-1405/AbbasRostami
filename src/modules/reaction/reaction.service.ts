import {
  ReactionTarget,
  ReactionType,
} from "../../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import {
  getReactionCounts,
  ReactionCounts,
} from "../../utils/reactionHelper.js";

const targetFieldMap: Record<
  ReactionTarget,
  "courseId" | "commentId" | "postId"
> = {
  COURSE: "courseId",
  COMMENT: "commentId",
  POST: "postId",
};

interface ToggleResult {
  message: string;
  myReaction: "LIKE" | "DISLIKE" | null;
  reactions: ReactionCounts;
}

const getMessage = (
  previousType: "LIKE" | "DISLIKE" | null,
  currentType: "LIKE" | "DISLIKE" | null,
): string => {
  if (!previousType && currentType === "LIKE") return "پسندیده شد";
  if (!previousType && currentType === "DISLIKE") return "نپسندیده شد";

  if (previousType === "LIKE" && !currentType) return "پسندیده‌تان برداشته شد";
  if (previousType === "DISLIKE" && !currentType)
    return "نپسندیده‌تان برداشته شد";

  if (previousType === "LIKE" && currentType === "DISLIKE")
    return "به نپسندیده تغییر یافت";
  if (previousType === "DISLIKE" && currentType === "LIKE")
    return "به پسندیده تغییر یافت";

  return "عملیات موفقیت‌آمیز بود";
};

export const reactionService = {
  async toggle(
    userId: string,
    targetType: ReactionTarget,
    targetId: string,
    type: ReactionType,
  ): Promise<ToggleResult> {
    const field = targetFieldMap[targetType];

    if (targetType === "COURSE") {
      const course = await prisma.course.findFirst({
        where: {
          id: targetId,
          published: true,
          OR: [{ categoryId: null }, { category: { show: true } }],
        },
        select: { id: true },
      });

      if (!course) {
        throw new AppError("دوره مورد نظر یافت نشد", 404);
      }
    }

    if (targetType === "POST") {
      const post = await prisma.post.findFirst({
        where: {
          id: targetId,
          published: true,
          OR: [{ categoryId: null }, { category: { show: true } }],
        },
        select: { id: true },
      });

      if (!post) {
        throw new AppError("پست مورد نظر یافت نشد", 404);
      }
    }

    if (targetType === "COMMENT") {
      const comment = await prisma.comment.findFirst({
        where: {
          id: targetId,
          status: "APPROVED",
        },
        select: { id: true },
      });

      if (!comment) {
        throw new AppError("کامنت مورد نظر یافت نشد", 404);
      }
    }

    const existing = await prisma.reaction.findFirst({
      where: { userId, [field]: targetId },
    });

    let myReaction: "LIKE" | "DISLIKE" | null;

    if (!existing) {
      await prisma.reaction.create({
        data: { type, targetType, userId, [field]: targetId },
      });
      myReaction = type;
    } else if (existing.type === type) {
      await prisma.reaction.delete({ where: { id: existing.id } });
      myReaction = null;
    } else {
      await prisma.reaction.update({
        where: { id: existing.id },
        data: { type },
      });
      myReaction = type;
    }

    const reactions = await getReactionCounts(field, targetId);
    const message = getMessage(existing?.type ?? null, myReaction);

    return {
      message,
      myReaction,
      reactions,
    };
  },
};
