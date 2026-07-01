export const courseSwagger = {
  paths: {
    "/api/courses": {
      get: {
        tags: ["Course"],
        summary: "Get all public courses with filters",
        description:
          "Returns published courses with category info. Supports filtering, search, sort and pagination. No authentication required.",
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
            description: "limit ( max:100 )",
          },
          {
            name: "categories",
            in: "query",
            schema: {
              type: "array",
              items: { type: "string" },
            },
            style: "form",
            explode: true,
            description:
              "فیلتر بر اساس چند دسته با slug. مثال: ?categories=frontend&categories=backend",
            example: ["frontend", "backend"],
          },
          {
            name: "level",
            in: "query",
            schema: {
              type: "string",
              enum: ["BEGINNER", "INTERMEDIATE", "ADVANCED"],
            },
            description: "فیلتر بر اساس سطح دوره",
          },
          {
            name: "minPrice",
            in: "query",
            schema: { type: "string" },
            description: "حداقل قیمت (به ریال)",
          },
          {
            name: "maxPrice",
            in: "query",
            schema: { type: "string" },
            description: "حداکثر قیمت (به ریال)",
          },
          {
            name: "search",
            in: "query",
            schema: { type: "string" },
            description: "جستجو در عنوان و توضیحات",
          },
          {
            name: "sortBy",
            in: "query",
            schema: {
              type: "string",
              enum: ["createdAt", "price", "title"],
              default: "createdAt",
            },
            description: "مرتب‌سازی بر اساس",
          },
          {
            name: "order",
            in: "query",
            schema: {
              type: "string",
              enum: ["asc", "desc"],
              default: "desc",
            },
            description: "ترتیب",
          },
        ],
        responses: {
          200: {
            description: "لیست دوره‌ها",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    items: [
                      {
                        id: "d3b07384-d113-4956-a5cc-484443028456",
                        title: "آموزش React پیشرفته",
                        slug: "آموزش-react-پیشرفته",
                        description: "یادگیری کامل React با Next.js",
                        price: 5000000,
                        imageUrl: "/uploads/courses/course-uuid.jpg",
                        level: "INTERMEDIATE",
                        published: true,
                        createdAt: "2026-01-15T14:00:00.000Z",
                        updatedAt: "2026-01-15T14:00:00.000Z",
                        category: {
                          id: "cat-uuid",
                          name: "فرانت‌اند",
                          slug: "فرانت-اند",
                        },
                        stats: {
                          enrollments: 25,
                          comments: 12,
                        },
                        reactions: {
                          likes: 45,
                          dislikes: 3,
                          myReaction: null,
                        },
                      },
                    ],
                    pagination: { page: 1, limit: 10, total: 50 },
                  },
                },
              },
            },
          },
          400: {
            description: "Validation error in query parameters",
            content: {
              "application/json": {
                example: {
                  status: "fail",
                  data: {
                    page: "page باید عدد باشد",
                    level:
                      "سطح دوره باید یکی از موارد زیر باشد: BEGINNER, INTERMEDIATE, ADVANCED",
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Course"],
        summary: "Create new course (Admin)",
        description: "Must be submitted as **multipart/form-data**.",
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["title", "price"],
                properties: {
                  title: {
                    type: "string",
                    minLength: 3,
                    maxLength: 150,
                    example: "آموزش React پیشرفته",
                  },
                  description: {
                    type: "string",
                    maxLength: 5000,
                    example: "یادگیری کامل React با Next.js",
                  },
                  price: {
                    type: "number",
                    minimum: 0,
                    maximum: 1000000000,
                    example: 5000000,
                    description: "قیمت به ریال (0 = رایگان)",
                  },
                  level: {
                    type: "string",
                    enum: ["BEGINNER", "INTERMEDIATE", "ADVANCED"],
                    default: "BEGINNER",
                    example: "INTERMEDIATE",
                  },
                  categoryId: {
                    type: "string",
                    format: "uuid",
                    example: "d3b07384-d113-4956-a5cc-484443028456",
                  },
                  published: {
                    type: "boolean",
                    default: false,
                    example: true,
                  },
                  image: {
                    type: "string",
                    format: "binary",
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Course is created successfully.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    message: "دوره با موفقیت ایجاد شد",
                    course: {
                      id: "d3b07384-d113-4956-a5cc-484443028456",
                      title: "آموزش React پیشرفته",
                      slug: "آموزش-react-پیشرفته",
                      description: "یادگیری کامل React",
                      price: 5000000,
                      imageUrl: "/uploads/courses/course-uuid.jpg",
                      level: "INTERMEDIATE",
                      published: true,
                      createdAt: "2026-01-15T14:00:00.000Z",
                      updatedAt: "2026-01-15T14:00:00.000Z",
                      category: {
                        id: "cat-uuid",
                        name: "فرانت‌اند",
                        slug: "فرانت-اند",
                      },
                      stats: {
                        enrollments: 0,
                        comments: 0,
                      },
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
  - Max length: 150.\n
- description:
  - Optional.
  - Must be a string.
  - Max length: 5000.\n
- price:
  - Must be a number.
  - Must be an integer.
  - Minimum: 0.
  - Maximum: 1000000000.\n
- level:
  - Optional.
  - Must be one of: BEGINNER, INTERMEDIATE, ADVANCED.
  - Default: BEGINNER.\n
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
  - Allowed formats: .jpg, .jpeg, .png, .webp.\n
- Duplicate title or invalid category may also return 400.`,
          },
          401: { description: "Unauthorized: Invalid or expired token." },
          403: { description: "Forbidden: Admin access required." },
        },
      },
    },

    "/api/courses/admin": {
      get: {
        tags: ["Course"],
        summary: "Get all courses - Admin",
        description: "Returns all courses (including unpublished/draft)",
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
            name: "categories",
            in: "query",
            schema: {
              type: "array",
              items: { type: "string" },
            },
            style: "form",
            explode: true,
            description:
              "فیلتر بر اساس چند  دسته با  slug. مثال: ?categories=frontend&categories=backend",
            example: ["frontend", "backend"],
          },
          {
            name: "level",
            in: "query",
            schema: {
              type: "string",
              enum: ["BEGINNER", "INTERMEDIATE", "ADVANCED"],
            },
            description: "Filter by Level",
          },
          {
            name: "published",
            in: "query",
            schema: { type: "string", enum: ["true", "false"] },
            description: "Filter by published status",
          },
          {
            name: "search",
            in: "query",
            schema: { type: "string" },
            description: "Search in title and description",
          },
          {
            name: "sortBy",
            in: "query",
            schema: {
              type: "string",
              enum: ["createdAt", "price", "title"],
            },
          },
          {
            name: "order",
            in: "query",
            schema: { type: "string", enum: ["asc", "desc"] },
          },
        ],
        responses: {
          200: {
            description: "List of All Courses.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    items: [
                      {
                        id: "d3b07384-d113-4956-a5cc-484443028456",
                        title: "آموزش React پیشرفته",
                        slug: "آموزش-react-پیشرفته",
                        description: "...",
                        price: 5000000,
                        imageUrl: "/uploads/courses/course-uuid.jpg",
                        level: "INTERMEDIATE",
                        published: false,
                        createdAt: "2026-01-15T14:00:00.000Z",
                        updatedAt: "2026-01-15T14:00:00.000Z",
                        category: {
                          id: "cat-uuid",
                          name: "فرانت‌اند",
                          slug: "فرانت-اند",
                        },
                        stats: {
                          enrollments: 0,
                          comments: 0,
                        },
                      },
                    ],
                    pagination: { page: 1, limit: 10, total: 75 },
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

    "/api/courses/{slug}": {
      get: {
        tags: ["Course"],
        summary: "Get course by slug",
        description:
          "Returns a single published course with category info and count of enrollments/comments/reactions. Only returns courses where category is active (show=true) or category is null.",
        parameters: [
          {
            name: "slug",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "slug",
          },
        ],
        responses: {
          200: {
            description: "Course is Fetched Successfully.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    course: {
                      id: "d3b07384-d113-4956-a5cc-484443028456",
                      title: "آموزش React پیشرفته",
                      slug: "آموزش-react-پیشرفته",
                      description: "یادگیری کامل React با Next.js",
                      price: 5000000,
                      imageUrl: "/uploads/courses/course-uuid.jpg",
                      level: "INTERMEDIATE",
                      published: true,
                      createdAt: "2026-01-15T14:00:00.000Z",
                      updatedAt: "2026-01-15T14:00:00.000Z",
                      category: {
                        id: "cat-uuid",
                        name: "فرانت‌اند",
                        slug: "فرانت-اند",
                      },
                      stats: {
                        enrollments: 125,
                        comments: 45,
                      },
                      reactions: {
                        likes: 45,
                        dislikes: 3,
                        myReaction: null,
                      },
                    },
                  },
                },
              },
            },
          },
          404: { description: "Course not found." },
        },
      },
    },

    "/api/courses/{id}": {
      put: {
        tags: ["Course"],
        summary: "Update course (Admin)",
        description:
          "CRITICAL: Must be submitted as **multipart/form-data**. All fields optional. If title changes, slug is auto-regenerated. If new image is uploaded, old image is deleted. To remove category, send categoryId=null.",
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
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  title: {
                    type: "string",
                    minLength: 3,
                    maxLength: 150,
                    example: "آموزش React پیشرفته (نسخه ۲)",
                  },
                  description: {
                    type: "string",
                    maxLength: 5000,
                    example: "توضیحات بروزرسانی شده",
                  },
                  price: {
                    type: "number",
                    minimum: 0,
                    maximum: 1000000000,
                    example: 6000000,
                  },
                  level: {
                    type: "string",
                    enum: ["BEGINNER", "INTERMEDIATE", "ADVANCED"],
                  },
                  categoryId: {
                    type: "string",
                    format: "uuid",
                    nullable: true,
                    description: "شناسه دسته جدید. برای حذف دسته، null بفرستید",
                  },
                  image: {
                    type: "string",
                    format: "binary",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Course is Edited Successfully.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    message: "دوره با موفقیت ویرایش شد",
                    course: {
                      id: "d3b07384-d113-4956-a5cc-484443028456",
                      title: "آموزش React پیشرفته (نسخه ۲)",
                      slug: "آموزش-react-پیشرفته-نسخه-۲",
                      description: "توضیحات بروزرسانی شده",
                      price: 6000000,
                      imageUrl: "/uploads/courses/course-new-uuid.jpg",
                      level: "INTERMEDIATE",
                      published: true,
                      createdAt: "2026-01-15T14:00:00.000Z",
                      updatedAt: "2026-01-15T15:00:00.000Z",
                      category: {
                        id: "cat-uuid",
                        name: "فرانت‌اند",
                        slug: "فرانت-اند",
                      },
                      stats: {
                        enrollments: 125,
                        comments: 45,
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: `Invalid request - Validation rules:\n
- id (path):
  - Must be a valid UUID v4.\n
- title:
  - Optional.
  - Must be a string.
  - Min length: 3.
  - Max length: 150.\n
- description:
  - Optional.
  - Must be a string.
  - Max length: 5000.\n
- price:
  - Optional.
  - Must be a number.
  - Must be an integer.
  - Minimum: 0.
  - Maximum: 1000000000.\n
- level:
  - Optional.
  - Must be one of: BEGINNER, INTERMEDIATE, ADVANCED.\n
- categoryId:
  - Optional.
  - Must be a valid UUID v4 or null.\n
- image:
  - Optional.
  - Max size: 5 MB.
  - Allowed formats: .jpg, .jpeg, .png, .webp.\n
- Duplicate title or invalid category may also return 400.\n
- At least one field is required.`,
          },
          401: { description: "Unauthorized: Invalid or expired token." },
          403: { description: "Forbidden: Admin access required." },
          404: { description: "Course not found." },
        },
      },

      delete: {
        tags: ["Course"],
        summary: "Delete course (Admin)",
        description:
          "Permanently deletes a course and its image file. All enrollments, comments, reactions and favorites will be cascade deleted.",
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
            description: "Course is Deleted Successfuly.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    message: "دوره با موفقیت حذف شد",
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized: Invalid or expired token." },
          403: { description: "Forbidden: Admin access required." },
          404: { description: "Course not found." },
        },
      },
    },

    "/api/courses/{id}/publish": {
      patch: {
        tags: ["Course"],
        summary: "Toggle course publish status (Admin)",
        description:
          "Publishes or unpublishes a course. Cannot publish a course if its category is hidden (show=false). Cannot toggle to current state.",
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
                  published: {
                    type: "boolean",
                    description: "true = منتشر، false = پنهان",
                    example: true,
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "وضعیت انتشار با موفقیت تغییر کرد.",
            content: {
              "application/json": {
                examples: {
                  published: {
                    summary: "انتشار",
                    value: {
                      status: "success",
                      data: {
                        message: "دوره با موفقیت منتشر شد",
                        course: {
                          id: "d3b07384-d113-4956-a5cc-484443028456",
                          title: "آموزش React پیشرفته",
                          slug: "آموزش-react-پیشرفته",
                          published: true,
                          createdAt: "2026-01-15T14:00:00.000Z",
                          updatedAt: "2026-01-15T15:00:00.000Z",
                          category: {
                            id: "cat-uuid",
                            name: "فرانت‌اند",
                            slug: "فرانت-اند",
                          },
                          stats: {
                            enrollments: 25,
                            comments: 12,
                          },
                        },
                      },
                    },
                  },
                  unpublished: {
                    summary: "پنهان‌سازی",
                    value: {
                      status: "success",
                      data: {
                        message: "دوره با موفقیت پنهان شد",
                        course: {
                          id: "d3b07384-d113-4956-a5cc-484443028456",
                          title: "آموزش React پیشرفته",
                          slug: "آموزش-react-پیشرفته",
                          published: false,
                          createdAt: "2026-01-15T14:00:00.000Z",
                          updatedAt: "2026-01-15T15:00:00.000Z",
                          category: {
                            id: "cat-uuid",
                            name: "فرانت‌اند",
                            slug: "فرانت-اند",
                          },
                          stats: {
                            enrollments: 25,
                            comments: 12,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "وضعیت تکراری یا دسته‌بندی غیرفعال.",
            content: {
              "application/json": {
                examples: {
                  alreadyPublished: {
                    summary: "از قبل منتشر شده",
                    value: {
                      status: "error",
                      message: "دوره از قبل منتشر شده است",
                      code: 400,
                    },
                  },
                  alreadyUnpublished: {
                    summary: "از قبل پنهان است",
                    value: {
                      status: "error",
                      message: "دوره از قبل پنهان است",
                      code: 400,
                    },
                  },
                  categoryDisabled: {
                    summary: "دسته‌بندی غیرفعال",
                    value: {
                      status: "error",
                      message:
                        "نمی‌توان دوره را منتشر کرد چون دسته‌بندی آن غیرفعال است",
                      code: 400,
                    },
                  },
                  invalidType: {
                    summary: "نوع نامعتبر",
                    value: {
                      status: "fail",
                      data: {
                        published: "وضعیت انتشار باید boolean باشد",
                      },
                    },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized: Invalid or expired token." },
          403: { description: "Forbidden: Admin access required." },
          404: { description: "Course not found." },
        },
      },
    },
  },
};
