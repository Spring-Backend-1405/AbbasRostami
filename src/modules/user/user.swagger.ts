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
        summary: "Get user info.",
        description: "Gets the data for the currently authenticated user",
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        responses: {
          200: {
            description: "مشخصات پروفایل کاربر با موفقیت دریافت شد.",
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
                      avatar: "/uploads/avatars/avatar-uuid.png",
                      createdAt: "2026-06-17T14:00:00.000Z",
                    },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized: Invalid or expired token." },
          404: {
            description:
              "User not found. This should not happen for an authenticated user.",
          },
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
            description: "پروفایل با موفقیت به‌روزرسانی شد.",
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
                      avatar: "/uploads/avatars/avatar-new-uuid.png",
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Validation error",
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
          "Deletes the physical avatar file and resets the database pointer to null.",
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        responses: {
          200: {
            description: "آواتار با موفقیت حذف شد.",
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
  },
};
