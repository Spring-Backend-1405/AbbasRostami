const cartExample = {
  id: "cart-uuid",
  totalAmount: 800000,
  totalItems: 2,
  items: [
    {
      id: "item-uuid-1",
      courseId: "course-uuid-1",
      title: "آموزش React پیشرفته",
      slug: "react-advanced",
      price: 500000,
      imageUrl: "/uploads/courses/react.jpg",
      level: "INTERMEDIATE",
      category: { id: "cat-1", name: "فرانت‌اند", slug: "frontend" },
      addedAt: "2026-01-15T14:00:00.000Z",
    },
  ],
};

export const cartSwagger = {
  paths: {
    "/api/cart": {
      get: {
        tags: ["Cart"],
        summary: "Get user's cart",
        description:
          "Returns active cart with all items and totalAmount for the authenticated user.",
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        responses: {
          200: {
            description: "سبد خرید.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: { cart: cartExample },
                },
              },
            },
          },
          401: { description: "Unauthorized: Invalid or expired token." },
        },
      },
      delete: {
        tags: ["Cart"],
        summary: "Clear entire cart",
        description: "Removes all items from the cart.",
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        responses: {
          200: {
            description: "سبد خرید خالی شد.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    message: "سبد خرید با موفقیت خالی شد",
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized: Invalid or expired token." },
        },
      },
    },

    "/api/cart/items": {
      post: {
        tags: ["Cart"],
        summary: "Add course to cart",
        description:
          "Adds a published, paid course to the cart. Cannot add free courses, already enrolled courses, or duplicates.",
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["courseId"],
                properties: {
                  courseId: { type: "string", format: "uuid" },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "دوره به سبد خرید اضافه شد.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    message: "دوره به سبد خرید اضافه شد",
                  },
                },
              },
            },
          },
          400: {
            description: `Invalid request - Validation rules:\n
- courseId:
  - Required.
  - Must be a valid UUID v4.\n
- Cannot add free courses (price = 0).
- Cannot add courses you are already enrolled in.`,
          },
          401: { description: "Unauthorized: Invalid or expired token." },
          404: { description: "Course not found or unpublished." },
          409: { description: "Course already in cart." },
        },
      },
    },

    "/api/cart/items/{courseId}": {
      delete: {
        tags: ["Cart"],
        summary: "Remove course from cart",
        description: "Removes a specific course from the cart.",
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        parameters: [
          {
            name: "courseId",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
            description: "id",
          },
        ],
        responses: {
          200: {
            description: "از سبد خرید حذف شد.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    message: "دوره از سبد خرید حذف شد",
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized: Invalid or expired token." },
          404: { description: "Item not found in cart." },
        },
      },
    },
  },
};
