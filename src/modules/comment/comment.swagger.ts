export const commentSwagger = {
  paths: {
    "/api/comments": {
      post: {
        tags: ["Comment"],
        summary: "Create a comment or reply",
        description:
          "Creates a new comment on a course or post. If parentId is provided, it becomes a reply. All comments start with PENDING status.",
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["content"],
                properties: {
                  content: {
                    type: "string",
                    minLength: 2,
                    maxLength: 1000,
                    example: "این دوره خیلی عالی بود",
                  },
                  courseId: {
                    type: "string",
                    format: "uuid",
                    description:
                      "شناسه دوره (یکی از courseId یا postId الزامی)",
                  },
                  postId: {
                    type: "string",
                    format: "uuid",
                    description: "شناسه پست (یکی از courseId یا postId الزامی)",
                  },
                  parentId: {
                    type: "string",
                    format: "uuid",
                    description: "شناسه کامنت والد (اختیاری - برای reply)",
                  },
                },
              },
              examples: {
                courseComment: {
                  summary: "کامنت روی دوره",
                  value: {
                    content: "این دوره خیلی عالی بود",
                    courseId: "6de9db62-0cf8-46f7-a74e-cdcb6d6f2a55",
                  },
                },
                reply: {
                  summary: "ریپلای به کامنت",
                  value: {
                    content: "موافقم، خیلی خوب بود",
                    courseId: "6de9db62-0cf8-46f7-a74e-cdcb6d6f2a55",
                    parentId: "dfc2a5b9-4170-4282-a0b7-21416b0ff4d1",
                  },
                },
                postComment: {
                  summary: "کامنت روی پست بلاگ",
                  value: {
                    content: "مقاله خوبی بود",
                    postId: "5a80bf83-f5be-4cf6-9980-b95d2a6b2475",
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Comment submitted successfully.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    message: "کامنت با موفقیت ثبت شد و در انتظار تأیید است",
                    comment: {
                      id: "0e4e44a8-bf48-4d4a-8d81-d6b92f0f9651",
                      content: "این دوره خیلی عالی بود",
                      status: "PENDING",
                      userId: "3f1fdca8-22c9-432f-99a5-c09d9a9f4ce3",
                      courseId: "6de9db62-0cf8-46f7-a74e-cdcb6d6f2a55",
                      postId: null,
                      parentId: null,
                      createdAt: "2026-01-10T12:00:00.000Z",
                      updatedAt: "2026-01-10T12:00:00.000Z",
                      user: {
                        id: "3f1fdca8-22c9-432f-99a5-c09d9a9f4ce3",
                        name: "Ali",
                        avatar: null,
                      },
                      stats: {
                        replies: 0,
                        reactions: 0,
                      },
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
                examples: {
                  validation: {
                    summary: "خطای اعتبارسنجی",
                    value: {
                      status: "fail",
                      data: {
                        content: "کامنت باید حداقل ۲ کاراکتر باشد",
                        courseId: "ارسال یکی از courseId یا postId الزامی است",
                      },
                    },
                  },
                  parentMismatch: {
                    summary: "عدم تطابق parent",
                    value: {
                      status: "error",
                      message: "parentId متعلق به این دوره نیست",
                      code: 400,
                    },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized: Invalid or expired token." },
          404: { description: "دوره، پست یا کامنت والد یافت نشد." },
        },
      },
    },

    "/api/comments/course/{slug}": {
      get: {
        tags: ["Comment"],
        summary: "Get course comments",
        description: "Returns approved comments for a course.",
        parameters: [
          {
            name: "slug",
            in: "path",
            required: true,
            schema: { type: "string", example: "react-advanced" },
            description: "slug",
          },
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
        ],
        responses: {
          200: {
            description: "List of course comments.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    course: {
                      id: "course-uuid",
                      title: "آموزش React پیشرفته",
                      slug: "react-advanced",
                    },
                    items: [
                      {
                        id: "c1",
                        content: "این دوره خیلی خوب بود",
                        status: "APPROVED",
                        userId: "u1",
                        courseId: "course-uuid",
                        postId: null,
                        parentId: null,
                        createdAt: "2026-01-10T12:00:00.000Z",
                        updatedAt: "2026-01-10T12:00:00.000Z",
                        user: {
                          id: "u1",
                          name: "Ali",
                          avatar: null,
                        },
                        stats: {
                          replies: 2,
                          reactions: 1,
                        },
                        replies: [
                          {
                            id: "c2",
                            content: "موافقم",
                            status: "APPROVED",
                            userId: "u2",
                            courseId: "course-uuid",
                            postId: null,
                            parentId: "c1",
                            createdAt: "2026-01-10T12:05:00.000Z",
                            updatedAt: "2026-01-10T12:05:00.000Z",
                            user: {
                              id: "u2",
                              name: "Sara",
                              avatar: "/uploads/avatars/sara.jpg",
                            },
                            stats: {
                              replies: 1,
                              reactions: 0,
                            },
                            replies: [
                              {
                                id: "c3",
                                content: "دقیقاً",
                                status: "APPROVED",
                                userId: "u3",
                                courseId: "course-uuid",
                                postId: null,
                                parentId: "c2",
                                createdAt: "2026-01-10T12:06:00.000Z",
                                updatedAt: "2026-01-10T12:06:00.000Z",
                                user: {
                                  id: "u3",
                                  name: "Reza",
                                  avatar: null,
                                },
                                stats: {
                                  replies: 0,
                                  reactions: 0,
                                },
                                replies: [],
                              },
                            ],
                          },
                        ],
                      },
                    ],
                    pagination: {
                      page: 1,
                      limit: 10,
                      total: 1,
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

    "/api/comments/post/{slug}": {
      get: {
        tags: ["Comment"],
        summary: "Get post comments (tree)",
        description:
          "Returns approved comments for a blog post as a tree structure with infinite depth. Pagination applies to root comments only.",
        parameters: [
          {
            name: "slug",
            in: "path",
            required: true,
            schema: { type: "string", example: "react-vs-vue" },
            description: "slug پست",
          },
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
        ],
        responses: {
          200: {
            description: "List of post comments as a tree.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    post: {
                      id: "post-uuid",
                      title: "مقایسه React و Vue",
                      slug: "react-vs-vue",
                    },
                    items: [
                      {
                        id: "c1",
                        content: "مقاله خیلی خوبی بود",
                        status: "APPROVED",
                        userId: "u1",
                        courseId: null,
                        postId: "post-uuid",
                        parentId: null,
                        createdAt: "2026-01-10T12:00:00.000Z",
                        updatedAt: "2026-01-10T12:00:00.000Z",
                        user: {
                          id: "u1",
                          name: "Ali",
                          avatar: null,
                        },
                        stats: { replies: 1 },
                        reactions: {
                          likes: 3,
                          dislikes: 0,
                          myReaction: null,
                        },
                        replies: [
                          {
                            id: "c2",
                            content: "موافقم",
                            status: "APPROVED",
                            userId: "u2",
                            courseId: null,
                            postId: "post-uuid",
                            parentId: "c1",
                            createdAt: "2026-01-10T12:05:00.000Z",
                            updatedAt: "2026-01-10T12:05:00.000Z",
                            user: {
                              id: "u2",
                              name: "Sara",
                              avatar: null,
                            },
                            stats: { replies: 0 },
                            reactions: {
                              likes: 1,
                              dislikes: 0,
                              myReaction: null,
                            },
                            replies: [],
                          },
                        ],
                      },
                    ],
                    pagination: {
                      page: 1,
                      limit: 10,
                      total: 1,
                    },
                  },
                },
              },
            },
          },
          404: { description: "Post not found." },
        },
      },
    },

    "/api/comments/my-comments": {
      get: {
        tags: ["Comment"],
        summary: "Get my comments",
        description:
          "Returns all comments of the authenticated user with optional status filter.",
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
            name: "status",
            in: "query",
            schema: {
              type: "string",
              enum: ["PENDING", "APPROVED", "REJECTED"],
            },
            description: "فیلتر بر اساس وضعیت",
          },
        ],
        responses: {
          200: {
            description: "List of user comments.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    items: [
                      {
                        id: "c1",
                        content: "این دوره خیلی خوب بود",
                        status: "PENDING",
                        userId: "u1",
                        courseId: "course-1",
                        postId: null,
                        parentId: null,
                        createdAt: "2026-01-10T12:00:00.000Z",
                        updatedAt: "2026-01-10T12:00:00.000Z",
                        user: {
                          id: "u1",
                          name: "Ali",
                          avatar: null,
                        },
                        parent: null,
                        course: {
                          id: "course-1",
                          title: "آموزش React پیشرفته",
                          slug: "react-advanced",
                        },
                        post: null,
                        stats: {
                          replies: 2,
                          reactions: 1,
                        },
                      },
                    ],
                    pagination: {
                      page: 1,
                      limit: 10,
                      total: 1,
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

    "/api/comments/admin": {
      get: {
        tags: ["Comment"],
        summary: "Get all comments (Admin)",
        description:
          "Returns all comments with filters for admin moderation panel.",
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
            schema: { type: "string", example: "20" },
          },
          {
            name: "status",
            in: "query",
            schema: {
              type: "string",
              enum: ["PENDING", "APPROVED", "REJECTED"],
            },
          },
          {
            name: "search",
            in: "query",
            schema: { type: "string", maxLength: 100 },
          },
        ],
        responses: {
          200: {
            description: "List of comments.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    items: [
                      {
                        id: "c1",
                        content: "این دوره خیلی خوب بود",
                        status: "PENDING",
                        userId: "u1",
                        courseId: "course-1",
                        postId: null,
                        parentId: null,
                        createdAt: "2026-01-10T12:00:00.000Z",
                        updatedAt: "2026-01-10T12:00:00.000Z",
                        user: {
                          id: "u1",
                          name: "Ali",
                          avatar: null,
                        },
                        parent: null,
                        course: {
                          id: "course-1",
                          title: "آموزش React پیشرفته",
                          slug: "react-advanced",
                        },
                        post: null,
                        stats: {
                          replies: 2,
                          reactions: 1,
                        },
                      },
                    ],
                    pagination: {
                      page: 1,
                      limit: 20,
                      total: 15,
                    },
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

    "/api/comments/{id}/approve": {
      patch: {
        tags: ["Comment"],
        summary: "Admin: Approve a comment",
        description: "Changes comment status to APPROVED.",
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
            description: "Comment approved successfully.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    message: "کامنت با موفقیت تأیید شد",
                    comment: {
                      id: "c1",
                      content: "این دوره خیلی خوب بود",
                      status: "APPROVED",
                      userId: "u1",
                      courseId: "course-1",
                      postId: null,
                      parentId: null,
                      createdAt: "2026-01-10T12:00:00.000Z",
                      updatedAt: "2026-01-10T12:10:00.000Z",
                      user: {
                        id: "u1",
                        name: "Ali",
                        avatar: null,
                      },
                      parent: null,
                      course: {
                        id: "course-1",
                        title: "آموزش React پیشرفته",
                        slug: "react-advanced",
                      },
                      post: null,
                      stats: {
                        replies: 2,
                        reactions: 1,
                      },
                    },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized: Invalid or expired token." },
          403: { description: "Access denied: Admin only." },
          404: { description: "Comment not found." },
          409: {
            description: "Comment is already approved.",
            content: {
              "application/json": {
                example: {
                  status: "error",
                  message: "این کامنت قبلاً تأیید شده است",
                  code: 409,
                },
              },
            },
          },
        },
      },
    },

    "/api/comments/{id}/reject": {
      patch: {
        tags: ["Comment"],
        summary: "Admin: Reject a comment",
        description: "Changes comment status to REJECTED.",
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
            description: "Comment rejected successfully.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    message: "کامنت با موفقیت رد شد",
                    comment: {
                      id: "c1",
                      content: "این دوره خیلی خوب بود",
                      status: "REJECTED",
                      userId: "u1",
                      courseId: "course-1",
                      postId: null,
                      parentId: null,
                      createdAt: "2026-01-10T12:00:00.000Z",
                      updatedAt: "2026-01-10T12:12:00.000Z",
                      user: {
                        id: "u1",
                        name: "Ali",
                        avatar: null,
                      },
                      parent: null,
                      course: {
                        id: "course-1",
                        title: "آموزش React پیشرفته",
                        slug: "react-advanced",
                      },
                      post: null,
                      stats: {
                        replies: 2,
                        reactions: 1,
                      },
                    },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized: Invalid or expired token." },
          403: { description: "Access denied: Admin only." },
          404: { description: "Comment not found." },
          409: {
            description: "Comment is already rejected.",
            content: {
              "application/json": {
                example: {
                  status: "error",
                  message: "این کامنت قبلاً رد شده است",
                  code: 409,
                },
              },
            },
          },
        },
      },
    },

    "/api/comments/{id}": {
      delete: {
        tags: ["Comment"],
        summary: "Delete a comment",
        description:
          "Deletes a comment. Only the comment owner or an admin can delete. Cascade deletes all replies.",
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
            description: "Comment deleted successfully.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    message: "کامنت با موفقیت حذف شد",
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized: Invalid or expired token." },
          403: {
            description:
              " permission denied: Only the comment owner or admin can delete.",
            content: {
              "application/json": {
                example: {
                  status: "error",
                  message: "شما اجازه حذف این کامنت را ندارید",
                  code: 403,
                },
              },
            },
          },
          404: { description: "Comment not found." },
        },
      },
    },
  },
};
