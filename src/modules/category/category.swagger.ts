export const categorySwagger = {
  paths: {
    "/api/categories": {
      get: {
        tags: ["Category"],
        summary: "Get all public categories",
        description:
          "Returns active categories (show=true) with count of published courses and posts. No authentication required.",
        responses: {
          200: {
            description: "List of active categories retrieved successfully.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    categories: [
                      {
                        id: "d3b07384-d113-4956-a5cc-484443028456",
                        name: "فرانت‌اند",
                        slug: "فرانت-اند",
                        description: "آموزش‌های توسعه frontend",
                        show: true,
                        createdAt: "2026-01-15T14:00:00.000Z",
                        updatedAt: "2026-01-15T14:00:00.000Z",
                        _count: { courses: 5, posts: 2 },
                      },
                    ],
                    total: 1,
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Category"],
        summary: "Create new category (Admin)",
        description:
          "Creates a new category. Slug is auto-generated from name (supports Persian).",
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name"],
                properties: {
                  name: {
                    type: "string",
                    minLength: 2,
                    maxLength: 50,
                    example: "فرانت‌اند",
                  },
                  description: {
                    type: "string",
                    maxLength: 500,
                    example: "آموزش‌های توسعه frontend",
                  },
                  show: {
                    type: "boolean",
                    default: true,
                    example: true,
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Category created successfully.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    message: "دسته با موفقیت ایجاد شد",
                    category: {
                      id: "d3b07384-d113-4956-a5cc-484443028456",
                      name: "فرانت‌اند",
                      slug: "فرانت-اند",
                      description: "آموزش‌های توسعه frontend",
                      show: true,
                      createdAt: "2026-01-15T14:00:00.000Z",
                      updatedAt: "2026-01-15T14:00:00.000Z",
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Validation error or duplicate name",
            content: {
              "application/json": {
                example: {
                  status: "fail",
                  data: { name: "این نام قبلاً استفاده شده است" },
                },
              },
            },
          },
          401: { description: "Unauthorized: Invalid or expired token." },
          403: { description: "Forbidden: Admin access required." },
        },
      },
    },

    "/api/categories/admin": {
      get: {
        tags: ["Category"],
        summary: "Get all categories with pagination (Admin)",
        description:
          "Returns all categories (including hidden) with pagination, search and filter.",
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        parameters: [
          {
            name: "page",
            in: "query",
            schema: { type: "string", example: "1" },
            description: "page",
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "string", example: "10" },
            description: "limit",
          },
          {
            name: "show",
            in: "query",
            schema: { type: "string", enum: ["true", "false"] },
            description: "فیلتر بر اساس وضعیت نمایش",
          },
          {
            name: "search",
            in: "query",
            schema: { type: "string" },
            description: "جستجو در نام و توضیحات",
          },
        ],
        responses: {
          200: {
            description: "Categories retrieved with pagination.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    items: [
                      {
                        id: "d3b07384-d113-4956-a5cc-484443028456",
                        name: "فرانت‌اند",
                        slug: "فرانت-اند",
                        description: "آموزش‌های frontend",
                        show: true,
                        createdAt: "2026-01-15T14:00:00.000Z",
                        updatedAt: "2026-01-15T14:00:00.000Z",
                        _count: { courses: 10, posts: 5 },
                      },
                    ],
                    pagination: { page: 1, limit: 10, total: 25 },
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

    "/api/categories/{slug}": {
      get: {
        tags: ["Category"],
        summary: "Get category by slug",
        description:
          "Returns a single active category with count of published items.",
        parameters: [
          {
            name: "slug",
            in: "path",
            required: true,
            schema: { type: "string", example: "فرانت-اند" },
            description: "slug",
          },
        ],
        responses: {
          200: {
            description: "Category retrieved successfully.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    category: {
                      id: "d3b07384-d113-4956-a5cc-484443028456",
                      name: "فرانت‌اند",
                      slug: "فرانت-اند",
                      description: "آموزش‌های توسعه frontend",
                      show: true,
                      createdAt: "2026-01-15T14:00:00.000Z",
                      updatedAt: "2026-01-15T14:00:00.000Z",
                      _count: { courses: 5, posts: 2 },
                    },
                  },
                },
              },
            },
          },
          404: { description: "Category not found." },
        },
      },
    },

    "/api/categories/{id}": {
      put: {
        tags: ["Category"],
        summary: "Update category (Admin)",
        description:
          "Updates category fields. If name changes, slug is auto-regenerated. All fields optional.",
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
            description: "id",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: {
                    type: "string",
                    minLength: 2,
                    maxLength: 50,
                    example: "Frontend Development",
                  },
                  description: {
                    type: "string",
                    maxLength: 500,
                    example: "توضیحات جدید",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Category updated successfully.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    message: "دسته با موفقیت ویرایش شد",
                    category: {
                      id: "d3b07384-d113-4956-a5cc-484443028456",
                      name: "Frontend Development",
                      slug: "frontend-development",
                      description: "توضیحات جدید",
                      show: true,
                      createdAt: "2026-01-15T14:00:00.000Z",
                      updatedAt: "2026-01-15T15:00:00.000Z",
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Validation error or duplicate name",
            content: {
              "application/json": {
                example: {
                  status: "fail",
                  data: { name: "این نام قبلاً استفاده شده است" },
                },
              },
            },
          },
          401: { description: "Unauthorized: Invalid or expired token." },
          403: { description: "Forbidden: Admin access required." },
          404: { description: "Category not found." },
        },
      },
      delete: {
        tags: ["Category"],
        summary: "Delete category (Admin)",
        description:
          "Permanently deletes a category. Associated courses and posts will have their categoryId set to null (not deleted).",
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
            description: "id",
          },
        ],
        responses: {
          200: {
            description: "Category deleted successfully.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    message: "دسته با موفقیت حذف شد",
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized: Invalid or expired token." },
          403: { description: "Forbidden: Admin access required." },
          404: { description: "Category not found." },
        },
      },
    },

    "/api/categories/{id}/visibility": {
      patch: {
        tags: ["Category"],
        summary: "Toggle category visibility (Admin)",
        description:
          "Activates/deactivates a category. When deactivated, all published courses and posts in this category will be unpublished. When activated, items remain unpublished and must be published manually.",
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string", format: "uuid" },
            description: "id",
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["show"],
                properties: {
                  show: {
                    type: "boolean",
                    description: "true = فعال، false = غیرفعال",
                    example: false,
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Status Category updated successfully.",
            content: {
              "application/json": {
                examples: {
                  disabled: {
                    summary: "غیرفعال‌سازی",
                    value: {
                      status: "success",
                      data: {
                        message: "دسته بندی با موفقیت غیرفعال شد",
                        category: {
                          id: "d3b07384-d113-4956-a5cc-484443028456",
                          name: "فرانت‌اند",
                          slug: "فرانت-اند",
                          description: "آموزش‌های frontend",
                          show: false,
                          createdAt: "2026-01-15T14:00:00.000Z",
                          updatedAt: "2026-01-15T15:00:00.000Z",
                        },
                      },
                    },
                  },
                  enabled: {
                    summary: "فعال‌سازی",
                    value: {
                      status: "success",
                      data: {
                        message: "دسته بندی با موفقیت فعال شد",
                        category: {
                          id: "d3b07384-d113-4956-a5cc-484443028456",
                          name: "فرانت‌اند",
                          slug: "فرانت-اند",
                          description: "آموزش‌های frontend",
                          show: true,
                          createdAt: "2026-01-15T14:00:00.000Z",
                          updatedAt: "2026-01-15T15:00:00.000Z",
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Status is duplicate or validation failed.",
            content: {
              "application/json": {
                example: {
                  status: "error",
                  message: "دسته بندی از قبل فعال است",
                  code: 400,
                },
              },
            },
          },
          401: { description: "Unauthorized: Invalid or expired token." },
          403: { description: "Forbidden: Admin access required." },
          404: { description: "Category not found." },
        },
      },
    },
  },
};
