export const userSwagger = {
  paths: {
    "/api/users/profile/overview": {
      get: {
        tags: ["User"],
        summary: "Get user profile overview",
        description:
          "Returns aggregated stats for the authenticated user's dashboard.",
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        responses: {
          200: {
            description: "Stats for User Profile.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    overview: {
                      enrollment: { total: 5 },
                      order: { total: 7, active: 1 },
                      wallet: { balance: 500000 },
                      comment: { total: 12, pending: 2 },
                      favorite: { courses: 3, posts: 2 },
                      cart: { items: 2 },
                      reaction: { total: 45 },
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
    "/api/users/profile": {
      get: {
        tags: ["User"],
        summary: "Get user info",
        description: "Gets the data for the currently authenticated user.",
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        responses: {
          200: {
            description: "User information retrieved successfully.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    profile: {
                      id: "d3b07384-d113-4956-a5cc-484443028456",
                      email: "abbas@example.com",
                      name: "عباس رستمی",
                      phone: "09123456789",
                      avatar:
                        "https://res.cloudinary.com/.../avatars/avatar.jpg",
                      role: "USER",
                      createdAt: "2026-06-17T14:00:00.000Z",
                      updatedAt: "2026-07-01T10:30:00.000Z",
                    },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized: Invalid or expired token." },
          404: { description: "User not found." },
        },
      },
      put: {
        tags: ["User"],
        summary: "Update profile & upload avatar",
        description:
          "CRITICAL: Must be submitted as **multipart/form-data**. Fields are optional. Files must be valid image formats up to 2MB.",
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        requestBody: {
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  name: {
                    type: "string",
                    description: "نام جدید کاربر (حداقل ۲ کاراکتر)",
                    example: "عباس رستمی ویرایش شده",
                  },
                  phone: {
                    type: "string",
                    description: "شماره تلفن همراه ایران (شروع با 09)",
                    example: "09121112233",
                  },
                  avatar: {
                    type: "string",
                    format: "binary",
                    description: "فایل تصویر آواتار (JPG, PNG, WEBP)",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Profile updated successfully.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    message: "پروفایل شما با موفقیت به‌روزرسانی شد",
                    profile: {
                      id: "d3b07384-d113-4956-a5cc-484443028456",
                      email: "abbas@example.com",
                      name: "عباس رستمی ویرایش شده",
                      phone: "09121112233",
                      avatar:
                        "https://res.cloudinary.com/.../avatars/avatar.jpg",
                      role: "USER",
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Validation error.",
            content: {
              "application/json": {
                example: {
                  status: "fail",
                  data: {
                    phone: "شماره موبایل وارد شده معتبر نیست",
                    name: "نام باید حداقل ۲ کاراکتر باشد",
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized: Invalid or expired token." },
        },
      },
    },
    "/api/users/profile/avatar": {
      delete: {
        tags: ["User"],
        summary: "Wipe user avatar",
        description:
          "Deletes the avatar file from cloud storage and resets the database pointer to null.",
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        responses: {
          200: {
            description: "Avatar deleted successfully.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: { message: "تصویر پروفایل شما با موفقیت حذف شد" },
                },
              },
            },
          },
          401: { description: "Unauthorized: Invalid or expired token." },
        },
      },
    },
    "/api/users": {
      get: {
        tags: ["User"],
        summary: "List all users (Admin)",
        description:
          "Returns a paginated list of all users with search, filter, and sort options. Admin only.",
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
          {
            name: "search",
            in: "query",
            schema: { type: "string", example: "عباس" },
            description: "Search by email and name",
          },
          {
            name: "role",
            in: "query",
            schema: { type: "string", enum: ["USER", "ADMIN"] },
            description: "Filter by Role",
          },
          {
            name: "isVerified",
            in: "query",
            schema: { type: "string", enum: ["true", "false"] },
            description: "Filter by isVerified EMAIL",
          },
          {
            name: "sortBy",
            in: "query",
            schema: {
              type: "string",
              enum: ["createdAt", "name", "email"],
              default: "createdAt",
            },
            description: "Sort by",
          },
          {
            name: "order",
            in: "query",
            schema: {
              type: "string",
              enum: ["asc", "desc"],
              default: "desc",
            },
            description: "Sort by order",
          },
        ],
        responses: {
          200: {
            description: "List of users.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    items: [
                      {
                        id: "acd482db-ca56-446c-95ca-ab29d92fb6ad",
                        email: "user@example.com",
                        name: "عباس رستمی",
                        phone: "09121112233",
                        avatar:
                          "https://res.cloudinary.com/.../avatars/avatar.jpg",
                        role: "USER",
                        isVerified: true,
                        createdAt: "2026-07-04T19:33:13.603Z",
                        stats: {
                          enrollments: 3,
                          orders: 5,
                          comments: 12,
                        },
                      },
                    ],
                    pagination: {
                      total: 25,
                      page: 1,
                      limit: 10,
                      totalPages: 3,
                      hasNextPage: true,
                      hasPrevPage: false,
                    },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized: Invalid or expired token." },
          403: { description: "Forbidden: Admin access required." },
        },
      },
    },
    "/api/users/{id}": {
      get: {
        tags: ["User"],
        summary: "Get user details (Admin)",
        description:
          "Returns detailed information about a specific user including wallet balance and activity stats. Admin only.",
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
          200: {
            description: "User details.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    user: {
                      id: "acd482db-ca56-446c-95ca-ab29d92fb6ad",
                      email: "user@example.com",
                      name: "عباس رستمی",
                      phone: "09121112233",
                      avatar:
                        "https://res.cloudinary.com/.../avatars/avatar.jpg",
                      role: "USER",
                      isVerified: true,
                      createdAt: "2026-07-04T19:33:13.603Z",
                      updatedAt: "2026-07-04T20:15:00.000Z",
                      walletBalance: 150000,
                      stats: {
                        enrollments: 3,
                        orders: 5,
                        comments: 12,
                        favoriteCourses: 4,
                        favoritePosts: 2,
                        reactions: 25,
                      },
                    },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized: Invalid or expired token." },
          403: { description: "Forbidden: Admin access required." },
          404: { description: "User not found." },
        },
      },
    },
  },
};
