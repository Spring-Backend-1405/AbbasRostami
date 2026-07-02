export const searchSwagger = {
  paths: {
    "/api/search": {
      get: {
        tags: ["Search"],
        summary: "Global search across courses and posts",
        description:
          "Searches published courses and blog posts by title/content. Returns limited results for quick search / autocomplete. For full results with pagination, use the dedicated list endpoints with search parameter.",
        parameters: [
          {
            name: "q",
            in: "query",
            required: true,
            schema: {
              type: "string",
              minLength: 1,
              maxLength: 100,
              example: "react",
            },
            description: "متن جستجو",
          },
          {
            name: "type",
            in: "query",
            schema: {
              type: "string",
              enum: ["course", "post"],
            },
            description:
              "فیلتر نوع نتایج. اگر ارسال نشود، هر دو جستجو می‌شوند.",
          },
          {
            name: "limit",
            in: "query",
            schema: {
              type: "string",
              example: "5",
            },
            description: "حداکثر تعداد نتایج هر نوع (پیش‌فرض: 5، حداکثر: 20)",
          },
        ],
        responses: {
          200: {
            description: "Search results.",
            content: {
              "application/json": {
                examples: {
                  both: {
                    summary: "جستجو در همه",
                    value: {
                      status: "success",
                      data: {
                        query: "react",
                        courses: [
                          {
                            id: "course-uuid",
                            title: "آموزش React پیشرفته",
                            slug: "react-advanced",
                            description: "یادگیری کامل React",
                            imageUrl: "/uploads/courses/react.jpg",
                            price: 500000,
                            level: "INTERMEDIATE",
                            category: {
                              id: "cat-uuid",
                              name: "فرانت‌اند",
                              slug: "frontend",
                            },
                          },
                        ],
                        posts: [
                          {
                            id: "post-uuid",
                            title: "مقایسه React و Vue",
                            slug: "react-vs-vue",
                            imageUrl: "/uploads/posts/react-vue.jpg",
                            category: {
                              id: "cat-uuid",
                              name: "فرانت‌اند",
                              slug: "frontend",
                            },
                          },
                        ],
                      },
                    },
                  },
                  courseOnly: {
                    summary: "فقط دوره‌ها",
                    value: {
                      status: "success",
                      data: {
                        query: "react",
                        courses: [
                          {
                            id: "course-uuid",
                            title: "آموزش React پیشرفته",
                            slug: "react-advanced",
                            description: "یادگیری کامل React",
                            imageUrl: "/uploads/courses/react.jpg",
                            price: 500000,
                            level: "INTERMEDIATE",
                            category: null,
                          },
                        ],
                        posts: [],
                      },
                    },
                  },
                  noResults: {
                    summary: "بدون نتیجه",
                    value: {
                      status: "success",
                      data: {
                        query: "xyz123",
                        courses: [],
                        posts: [],
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: `Invalid request - Validation rules:\n
- q:
  - Must not be empty.
  - Must be a string.
  - Min length: 1.
  - Max length: 100.\n
- type:
  - Optional.
  - Must be one of: course, post.\n
- limit:
  - Optional.
  - Must be a number.
  - Default: 5, Maximum: 20.`,
          },
        },
      },
    },
  },
};
