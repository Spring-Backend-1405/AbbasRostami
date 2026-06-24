export const enrollmentSwagger = {
  paths: {
    "/api/enrollments/{slug}": {
      post: {
        tags: ["Enrollment"],
        summary: "Enroll in a course",
        description:
          "Enrolls the authenticated user in a course. If course is paid, deducts from wallet balance. If free, just creates enrollment.",
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        parameters: [
          {
            name: "slug",
            in: "path",
            required: true,
            schema: { type: "string" },
            description: "slug دوره",
          },
        ],
        responses: {
          201: {
            description: "ثبت‌نام موفقیت‌آمیز.",
            content: {
              "application/json": {
                examples: {
                  paidCourse: {
                    summary: "دوره پولی",
                    value: {
                      status: "success",
                      data: {
                        enrollment: {
                          id: "enroll-uuid",
                          pricePaid: 500000,
                          createdAt: "2026-01-15T14:00:00.000Z",
                          course: {
                            id: "course-uuid",
                            title: "آموزش React پیشرفته",
                            slug: "آموزش-react-پیشرفته",
                            imageUrl: "/uploads/courses/course-uuid.jpg",
                            price: 500000,
                          },
                        },
                        transaction: {
                          id: "tx-uuid",
                          amount: 500000,
                          type: "PURCHASE",
                          status: "SUCCESS",
                          description: "خرید دوره: آموزش React پیشرفته",
                        },
                        newBalance: 4500000,
                        message: "خرید دوره با موفقیت انجام شد",
                      },
                    },
                  },
                  freeCourse: {
                    summary: "دوره رایگان",
                    value: {
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
            },
          },
          400: {
            description: "ثبت‌نام مجدد یا موجودی ناکافی.",
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
                  insufficientBalance: {
                    summary: "موجودی ناکافی",
                    value: {
                      status: "fail",
                      data: {
                        balance: "موجودی فعلی: 100000 ریال",
                      },
                    },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized: Invalid or expired token." },
          404: { description: "دوره یافت نشد." },
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
            description: "شماره صفحه",
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "string", example: "10" },
            description: "تعداد در هر صفحه",
          },
        ],
        responses: {
          200: {
            description: "لیست دوره‌های خریداری شده.",
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
                            reactions: 45,
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
