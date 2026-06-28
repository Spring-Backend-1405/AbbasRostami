export const postSwagger = {
  paths: {
    "/api/posts": {
      get: {
        tags: ["Post"],
        summary: "Get public posts",
        description: "Returns list of published blog posts with filters.",
        parameters: [
          {
            name: "page",
            in: "query",
            schema: { type: "string", example: "1" },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "string", example: "10" },
          },
          {
            name: "category",
            in: "query",
            schema: { type: "string" },
            description: "slug",
          },
          {
            name: "search",
            in: "query",
            schema: { type: "string", example: "react" },
          },
          {
            name: "sortBy",
            in: "query",
            schema: {
              type: "string",
              enum: ["createdAt", "title"],
              default: "createdAt",
            },
          },
          {
            name: "order",
            in: "query",
            schema: {
              type: "string",
              enum: ["asc", "desc"],
              default: "desc",
            },
          },
        ],
        responses: {
          200: {
            description: "لیست پست‌ها.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    items: [
                      {
                        id: "post-uuid",
                        title: "مقایسه React و Vue",
                        slug: "react-vs-vue",
                        content: "در این مقاله...",
                        imageUrl: "/uploads/posts/react-vue.jpg",
                        published: true,
                        createdAt: "2026-01-10T12:00:00.000Z",
                        updatedAt: "2026-01-10T12:00:00.000Z",
                        category: {
                          id: "cat-uuid",
                          name: "فرانت‌اند",
                          slug: "frontend",
                        },
                        stats: { comments: 8 },
                        reactions: {
                          likes: 23,
                          dislikes: 2,
                          myReaction: null,
                        },
                        isFavorite: false,
                      },
                    ],
                    pagination: { page: 1, limit: 10, total: 5 },
                  },
                },
              },
            },
          },
        },
      },

      post: {
        tags: ["Post"],
        summary: "Create a post (Admin)",
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        requestBody: {
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["title", "content"],
                properties: {
                  title: { type: "string", example: "مقایسه React و Vue" },
                  content: { type: "string", example: "در این مقاله..." },
                  categoryId: { type: "string", format: "uuid" },
                  published: { type: "boolean", default: false },
                  image: { type: "string", format: "binary" },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "پست با موفقیت ایجاد شد.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    message: "پست با موفقیت ایجاد شد",
                    post: {
                      id: "post-uuid",
                      title: "مقایسه React و Vue",
                      slug: "react-vs-vue",
                      content: "در این مقاله...",
                      imageUrl: "/uploads/posts/post-uuid.jpg",
                      published: false,
                      category: null,
                      stats: { comments: 0 },
                      createdAt: "2026-01-10T12:00:00.000Z",
                      updatedAt: "2026-01-10T12:00:00.000Z",
                    },
                  },
                },
              },
            },
          },
          400: {
            description: `Invalid request - Validation rules:\n
- title:
  - Must not be empty.
  - Must be a string.
  - Min length: 3.
  - Max length: 200.\n
- content:
  - Must not be empty.
  - Must be a string.
  - Min length: 10.\n
- categoryId:
  - Optional.
  - Must be a valid UUID v4.\n
- published:
  - Optional.
  - Must be a boolean.
  - Default: false.\n
- image:
  - Optional.
  - Max size: 5 MB.
  - Allowed formats: .jpg, .jpeg, .png, .webp.`,
          },
          401: { description: "Unauthorized: Invalid or expired token." },
          403: { description: "Access denied: Admin only." },
        },
      },
    },

    "/api/posts/admin": {
      get: {
        tags: ["Post"],
        summary: "Get all posts (Admin)",
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        parameters: [
          { name: "page", in: "query", schema: { type: "string" } },
          { name: "limit", in: "query", schema: { type: "string" } },
          {
            name: "published",
            in: "query",
            schema: { type: "string", enum: ["true", "false"] },
          },
          { name: "search", in: "query", schema: { type: "string" } },
        ],
        responses: {
          200: {
            description: "لیست همه پست‌ها.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    items: [],
                    pagination: { page: 1, limit: 10, total: 0 },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized: Invalid or expired token." },
          403: { description: "Access denied: Admin only." },
        },
      },
    },

    "/api/posts/{slug}": {
      get: {
        tags: ["Post"],
        summary: "Get post by slug",
        parameters: [
          {
            name: "slug",
            in: "path",
            required: true,
            schema: { type: "string", example: "react-vs-vue" },
          },
        ],
        responses: {
          200: {
            description: "جزئیات پست.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    post: {
                      id: "post-uuid",
                      title: "مقایسه React و Vue",
                      slug: "react-vs-vue",
                      content: "در این مقاله...",
                      imageUrl: "/uploads/posts/react-vue.jpg",
                      published: true,
                      category: {
                        id: "cat-uuid",
                        name: "فرانت‌اند",
                        slug: "frontend",
                      },
                      stats: { comments: 8 },
                      reactions: {
                        likes: 23,
                        dislikes: 2,
                        myReaction: "LIKE",
                      },
                      isFavorite: true,
                      createdAt: "2026-01-10T12:00:00.000Z",
                      updatedAt: "2026-01-10T12:00:00.000Z",
                    },
                  },
                },
              },
            },
          },
          404: { description: "Post not found" },
        },
      },
    },

    "/api/posts/{id}": {
      put: {
        tags: ["Post"],
        summary: "Update a post (Admin)",
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        requestBody: {
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  content: { type: "string" },
                  categoryId: { type: "string", format: "uuid" },
                  image: { type: "string", format: "binary" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "پست ویرایش شد." },
          400: {
            description: `Invalid request - Validation rules:\n
- id (path):
  - Must be a valid UUID v4.\n
- title:
  - Optional.
  - Must be a string.
  - Min length: 3.
  - Max length: 200.\n
- content:
  - Optional.
  - Must be a string.
  - Min length: 10.\n
- categoryId:
  - Optional.
  - Must be a valid UUID v4 or null.\n
- published:
  - Optional.
  - Must be a boolean.\n
- image:
  - Optional.
  - Max size: 5 MB.
  - Allowed formats: .jpg, .jpeg, .png, .webp.
At least one field is required.`,
          },
          401: { description: "Unauthorized: Invalid or expired token." },
          403: { description: "Access denied: Admin only." },
          404: { description: "Post not found" },
        },
      },

      delete: {
        tags: ["Post"],
        summary: "Delete a post (Admin)",
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        responses: {
          200: { description: "پست حذف شد." },
          401: { description: "Unauthorized: Invalid or expired token." },
          403: { description: "Access denied: Admin only." },
          404: { description: "Post not found" },
        },
      },
    },

    "/api/posts/{id}/publish": {
      patch: {
        tags: ["Post"],
        summary: "Toggle post publish (Admin)",
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["published"],
                properties: {
                  published: { type: "boolean", example: true },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "وضعیت انتشار تغییر کرد." },
          400: { description: "پست از قبل در این وضعیت است." },
          401: { description: "Unauthorized: Invalid or expired token." },
          403: { description: "Access denied: Admin only." },
          404: { description: "Post not found" },
        },
      },
    },
  },
};
