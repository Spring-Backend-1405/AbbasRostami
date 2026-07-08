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
                    message: "دسته بندی با موفقیت ایجاد شد",
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
            description: `Invalid request - Validation rules:

- name:
  - Must not be empty.
  - Must be a string.
  - Min length: 2.
  - Max length: 50.

- description:
  - Optional.
  - Must be a string.
  - Max length: 500.

- show:
  - Optional.
  - Must be a boolean.
  - Default: true.

- Duplicate name may also return 400.`,
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
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "string", example: "10" },
          },
          {
            name: "show",
            in: "query",
            schema: { type: "string", enum: ["true", "false"] },
            description: "Filter by visibility status",
          },
          {
            name: "search",
            in: "query",
            schema: { type: "string" },
            description: "Search by name or description",
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
                    pagination: {
                      total: 25,
                      page: 1,
                      limit: 10,
                    },
                  },
                },
              },
            },
          },
          400: {
            description: `Invalid request - Validation rules:

- page:
  - Optional.
  - Must be a numeric string.

- limit:
  - Optional.
  - Must be a numeric string.

- show:
  - Optional.
  - Must be one of: true, false.

- search:
  - Optional.
  - Must be a string.
  - Max length: 100.`,
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
          400: {
            description: `Invalid request - Validation rules:

- slug (path):
  - Must not be empty.
  - Max length: 100.`,
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
          "Updates category fields. If name changes, slug is auto-regenerated. At least one field is required.",
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
            description: `Invalid request - Validation rules:

- id (path):
  - Must be a valid UUID v4.

- name:
  - Optional.
  - Must be a string.
  - Min length: 2.
  - Max length: 50.

- description:
  - Optional.
  - Must be a string.
  - Max length: 500.

- At least one field is required.
- Duplicate name may also return 400.`,
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
          "Permanently deletes a category. **Cannot delete a category that has courses or posts assigned.** First reassign or delete those items.",
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
            description: "Category deleted successfully.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    message: "دسته بندی با موفقیت حذف شد",
                  },
                },
              },
            },
          },
          400: {
            description: `Invalid request - Validation rules:

- id (path):
  - Must be a valid UUID v4.

- Cannot delete a category that has courses assigned.
- Cannot delete a category that has posts assigned.
- First reassign or delete all courses and posts in this category.`,
            content: {
              "application/json": {
                examples: {
                  hasCourses: {
                    summary: "دوره دارد",
                    value: {
                      status: "error",
                      message:
                        "این دسته بندی ۳ دوره دارد. ابتدا دوره‌ها را حذف یا به دسته دیگری منتقل کنید",
                      code: 400,
                    },
                  },
                  hasPosts: {
                    summary: "مقاله دارد",
                    value: {
                      status: "error",
                      message:
                        "این دسته بندی ۵ مقاله دارد. ابتدا مقاله‌ها را حذف یا به دسته دیگری منتقل کنید",
                      code: 400,
                    },
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
          "Activates or deactivates a category. When deactivated, all published courses and posts in this category will be automatically unpublished. When activated, items remain unpublished and must be published manually.",
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
                required: ["show"],
                properties: {
                  show: {
                    type: "boolean",
                    example: false,
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Category visibility updated successfully.",
            content: {
              "application/json": {
                examples: {
                  disabled: {
                    value: {
                      status: "success",
                      data: {
                        message:
                          "دسته بندی با موفقیت غیرفعال شد. دوره‌ها و پست‌های وابسته نیز غیرفعال شدند.",
                      },
                    },
                  },
                  enabled: {
                    value: {
                      status: "success",
                      data: {
                        message:
                          "دسته بندی با موفقیت فعال شد. برای انتشار دوره‌ها، آن‌ها را به صورت جداگانه فعالسازی کنید.",
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: `Invalid request - Validation rules:

- id (path):
  - Must be a valid UUID v4.

- show:
  - Must not be empty.
  - Must be a boolean.

- Category must not already be in the requested state.`,
            content: {
              "application/json": {
                examples: {
                  alreadyActive: {
                    summary: "از قبل فعال است",
                    value: {
                      status: "error",
                      message: "دسته بندی از قبل فعال است",
                      code: 400,
                    },
                  },
                  alreadyInactive: {
                    summary: "از قبل غیرفعال است",
                    value: {
                      status: "error",
                      message: "دسته بندی از قبل غیرفعال است",
                      code: 400,
                    },
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
  },
};
