export const enrollmentSwagger = {
  paths: {
    "/api/enrollments/{slug}": {
      post: {
        tags: ["Enrollment"],
        summary: "Enroll in a free course",
        description:
          "Enrolls the authenticated user in a free course only. Paid courses must be purchased through cart and checkout flow.",
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
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
          201: {
            description: "Enrollment created successfully.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    enrollment: {
                      id: "enroll-uuid",
                      pricePaid: 0,
                      createdAt: "2026-01-15T14:00:00.000Z",
                      course: {
                        id: "course-uuid",
                        title: "آموزش Git مقدماتی",
                        slug: "آموزش-git",
                        imageUrl: "/uploads/courses/course-uuid.jpg",
                        price: 0,
                      },
                    },
                    message: "با موفقیت در دوره رایگان ثبت‌نام شدید",
                  },
                },
              },
            },
          },
          400: {
            description:
              "ثبت‌نام تکراری یا تلاش برای ثبت‌نام مستقیم در دوره پولی.",
            content: {
              "application/json": {
                examples: {
                  alreadyEnrolled: {
                    summary: "قبلاً ثبت‌نام کرده",
                    value: {
                      status: "fail",
                      data: {
                        message: "شما قبلاً در این دوره ثبت‌نام کرده‌اید",
                      },
                    },
                  },
                  paidCourse: {
                    summary: "دوره پولی",
                    value: {
                      status: "error",
                      message:
                        "برای خرید دوره‌های پولی از سبد خرید استفاده کنید",
                      code: 400,
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

    "/api/enrollments/my-courses": {
      get: {
        tags: ["Enrollment"],
        summary: "Get user's enrolled courses",
        description:
          "Returns list of courses the user has enrolled in, with pagination.",
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        parameters: [
          {
            name: "page",
            in: "query",
            schema: { type: "string", example: "1" },
            description: "Page",
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
            description: "List of enrolled courses.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    items: [
                      {
                        id: "enroll-uuid",
                        pricePaid: 500000,
                        enrolledAt: "2026-01-15T14:00:00.000Z",
                        course: {
                          id: "course-uuid",
                          title: "آموزش React پیشرفته",
                          slug: "آموزش-react-پیشرفته",
                          imageUrl: "/uploads/courses/course-uuid.jpg",
                          price: 500000,
                          level: "INTERMEDIATE",
                          published: true,
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
                    ],
                    pagination: { page: 1, limit: 10, total: 5 },
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
