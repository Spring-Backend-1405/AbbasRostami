export const favoriteSwagger = {
  paths: {
    "/api/favorites/courses/{courseId}": {
      post: {
        tags: ["Favorite"],
        summary: "Toggle course favorite",
        description:
          "Saves or removes a course from favorites. If already saved, removes it. If not saved, adds it.",
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
            description: "Fetching successfully.",
            content: {
              "application/json": {
                examples: {
                  saved: {
                    summary: "دوره ذخیره شد",
                    value: {
                      status: "success",
                      data: {
                        message: "دوره به علاقه‌مندی‌ها اضافه شد",
                        isFavorite: true,
                      },
                    },
                  },
                  removed: {
                    summary: "دوره حذف شد",
                    value: {
                      status: "success",
                      data: {
                        message: "دوره از علاقه‌مندی‌ها حذف شد",
                        isFavorite: false,
                      },
                    },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized: Invalid or expired token." },
          404: { description: "Course not found." },
        },
      },
    },

    "/api/favorites/courses": {
      get: {
        tags: ["Favorite"],
        summary: "Get my favorite courses",
        description: "Returns list of courses saved by the authenticated user.",
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
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
        ],
        responses: {
          200: {
            description: "List of favorite courses.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    items: [
                      {
                        id: "fav-uuid",
                        savedAt: "2026-01-10T12:00:00.000Z",
                        course: {
                          id: "course-uuid",
                          title: "آموزش React پیشرفته",
                          slug: "react-advanced",
                          imageUrl: "/uploads/courses/react.jpg",
                          price: 500000,
                          level: "INTERMEDIATE",
                          published: true,
                          category: {
                            id: "cat-uuid",
                            name: "فرانت‌اند",
                            slug: "frontend",
                          },
                          stats: {
                            enrollments: 25,
                            comments: 12,
                          },
                        },
                      },
                    ],
                    pagination: {
                      page: 1,
                      limit: 10,
                      total: 3,
                    },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized: Invalid or expired token." },
        },
      },
    },

    "/api/favorites/posts/{postId}": {
      post: {
        tags: ["Favorite"],
        summary: "Toggle post favorite",
        description: "Saves or removes a blog post from favorites.",
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        parameters: [
          {
            name: "postId",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
            description: "شناسه پست",
          },
        ],
        responses: {
          200: {
            description: "Fetching Successfully.",
            content: {
              "application/json": {
                examples: {
                  saved: {
                    summary: "پست ذخیره شد",
                    value: {
                      status: "success",
                      data: {
                        message: "پست به علاقه‌مندی‌ها اضافه شد",
                        isFavorite: true,
                      },
                    },
                  },
                  removed: {
                    summary: "پست حذف شد",
                    value: {
                      status: "success",
                      data: {
                        message: "پست از علاقه‌مندی‌ها حذف شد",
                        isFavorite: false,
                      },
                    },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized: Invalid or expired token." },
          404: { description: "Post not found." },
        },
      },
    },

    "/api/favorites/posts": {
      get: {
        tags: ["Favorite"],
        summary: "Get my favorite posts",
        description:
          "Returns list of blog posts saved by the authenticated user.",
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
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
        ],
        responses: {
          200: {
            description: "List of favorite posts.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    items: [
                      {
                        id: "fav-uuid",
                        savedAt: "2026-01-10T12:00:00.000Z",
                        post: {
                          id: "post-uuid",
                          title: "مقایسه React و Vue",
                          slug: "react-vs-vue",
                          imageUrl: "/uploads/posts/react-vue.jpg",
                          published: true,
                          category: {
                            id: "cat-uuid",
                            name: "فرانت‌اند",
                            slug: "frontend",
                          },
                          stats: {
                            comments: 8,
                          },
                        },
                      },
                    ],
                    pagination: {
                      page: 1,
                      limit: 10,
                      total: 2,
                    },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized: Invalid or expired token." },
        },
      },
    },
  },
};
