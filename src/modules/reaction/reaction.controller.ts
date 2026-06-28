import { RequestHandler } from "express";
import {
  ReactionTarget,
  ReactionType,
} from "../../../generated/prisma/client.js";
import { reactionService } from "./reaction.service.js";
import { ToggleReactionBody } from "./reaction.validator.js";

const createToggleController = (targetType: ReactionTarget): RequestHandler => {
  return async (req, res) => {
    const userId = req.user!.id;
    const targetId = req.params.id as string;
    const { type } = req.body as ToggleReactionBody;

    const result = await reactionService.toggle(
      userId,
      targetType,
      targetId,
      type as ReactionType,
    );

    return res.status(200).json({
      status: "success",
      data: result,
    });
  };
};

export const toggleCourseReaction = createToggleController("COURSE");
export const togglePostReaction = createToggleController("POST");
export const toggleCommentReaction = createToggleController("COMMENT");
