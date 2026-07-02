const reactionResponseExample = {
  status: "success",
  data: {
    message: "پسندیده شد",
    myReaction: "LIKE",
    reactions: {
      likes: 46,
      dislikes: 3,
    },
  },
};

const reactionRemovedExample = {
  status: "success",
  data: {
    message: "پسندیده‌تان برداشته شد",
    myReaction: null,
    reactions: {
      likes: 45,
      dislikes: 3,
    },
  },
};

const reactionRequestBody = {
  required: true,
  content: {
    "application/json": {
      schema: {
        type: "object",
        required: ["type"],
        properties: {
          type: {
            type: "string",
            enum: ["LIKE", "DISLIKE"],
            example: "LIKE",
          },
        },
      },
    },
  },
};

const reactionParam = {
  name: "id",
  in: "path",
  required: true,
  schema: { type: "string", format: "uuid" },
};

const reactionResponses = {
  200: {
    description: "Operation completed successfully.",
    content: {
      "application/json": {
        examples: {
          liked: {
            summary: "لایک ثبت شد",
            value: reactionResponseExample,
          },
          removed: {
            summary: "واکنش برداشته شد",
            value: reactionRemovedExample,
          },
          toggled: {
            summary: "از لایک به دیسلایک تغییر کرد",
            value: {
              status: "success",
              data: {
                myReaction: "DISLIKE",
                reactions: {
                  likes: 44,
                  dislikes: 4,
                },
              },
            },
          },
        },
      },
    },
  },
  401: { description: "Unauthorized: Invalid or expired token." },
  404: { description: "Item not found." },
};

export const reactionSwagger = {
  paths: {
    "/api/courses/{id}/reaction": {
      post: {
        tags: ["Reaction"],
        summary: "Toggle reaction on a course",
        description:
          "Toggles like or dislike on a course. If same type exists, removes it. If opposite type exists, switches it.",
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        parameters: [{ ...reactionParam, description: "id" }],
        requestBody: reactionRequestBody,
        responses: reactionResponses,
      },
    },

    "/api/posts/{id}/reaction": {
      post: {
        tags: ["Reaction"],
        summary: "Toggle reaction on a post",
        description: "Toggles like or dislike on a blog post.",
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        parameters: [{ ...reactionParam, description: "id" }],
        requestBody: reactionRequestBody,
        responses: reactionResponses,
      },
    },

    "/api/comments/{id}/reaction": {
      post: {
        tags: ["Reaction"],
        summary: "Toggle reaction on a comment",
        description: "Toggles like or dislike on an approved comment.",
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        parameters: [{ ...reactionParam, description: "id" }],
        requestBody: reactionRequestBody,
        responses: reactionResponses,
      },
    },
  },
};
