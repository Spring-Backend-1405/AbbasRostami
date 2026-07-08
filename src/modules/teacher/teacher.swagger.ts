export const teacherSwagger = {
  paths: {
    "/api/teachers": {
      get: {
        tags: ["Teacher"],
        summary: "Get all teachers",
        description: "Returns list of all teachers with course count.",
        parameters: [
          {
            name: "page",
            in: "query",
            schema: { type: "string", example: "1" },
            description: "Page number",
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "string", example: "10" },
            description: "Items per page",
          },
          {
            name: "search",
            in: "query",
            schema: { type: "string" },
            description: "Search by name or bio",
          },
        ],
        responses: {
          200: {
            description: "List of teachers.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    items: [
                      {
                        id: "teacher-uuid",
                        name: "عباس رستمی",
                        slug: "abbas-rostami",
                        bio: "توسعه‌دهنده فول‌استک",
                        avatar:
                          "https://res.cloudinary.com/.../teachers/avatar.jpg",
                        coursesCount: 5,
                        createdAt: "2026-01-10T12:00:00.000Z",
                        updatedAt: "2026-01-10T12:00:00.000Z",
                      },
                    ],
                    pagination: {
                      total: 3,
                      page: 1,
                      limit: 10,
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Teacher"],
        summary: "Create a teacher (Admin)",
        description: "Must be submitted as **multipart/form-data**.",
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["name"],
                properties: {
                  name: {
                    type: "string",
                    minLength: 2,
                    maxLength: 100,
                  },
                  bio: {
                    type: "string",
                    maxLength: 2000,
                  },
                  avatar: {
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
            description: "Teacher created successfully.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    message: "مدرس با موفقیت ایجاد شد",
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
  - Max length: 100.

- bio:
  - Optional.
  - Must be a string.
  - Max length: 2000.

- avatar:
  - Optional.
  - Max size: 2 MB.
  - Allowed formats: .jpg, .jpeg, .png, .webp.

- Duplicate name may also return 400.`,
          },
          401: { description: "Unauthorized: Invalid or expired token." },
          403: { description: "Forbidden: Admin access required." },
        },
      },
    },

    "/api/teachers/{slug}": {
      get: {
        tags: ["Teacher"],
        summary: "Get teacher by slug",
        description:
          "Returns teacher details along with their published courses.",
        parameters: [
          {
            name: "slug",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          200: {
            description: "Teacher details with courses.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    teacher: {
                      id: "teacher-uuid",
                      name: "Abbas Rostami",
                      slug: "abbas-rostami",
                      bio: "توسعه‌دهنده",
                      avatar:
                        "https://res.cloudinary.com/.../teachers/avatar.jpg",
                      createdAt: "2026-01-10T12:00:00.000Z",
                      updatedAt: "2026-01-10T12:00:00.000Z",
                      courses: [
                        {
                          id: "course-uuid",
                          title: "آموزش React",
                          slug: "react-course",
                          description: "یادگیری کامل React با Next.js",
                          price: 5000000,
                          imageUrl:
                            "https://res.cloudinary.com/.../courses/react.jpg",
                          level: "INTERMEDIATE",
                          category: {
                            id: "cat-uuid",
                            name: "فرانت‌اند",
                            slug: "frontend",
                          },
                          studentsCount: 120,
                          createdAt: "2026-01-15T14:00:00.000Z",
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
          404: { description: "Teacher not found." },
        },
      },
    },

    "/api/teachers/{id}": {
      put: {
        tags: ["Teacher"],
        summary: "Update a teacher (Admin)",
        description:
          "Must be submitted as **multipart/form-data**. All fields are optional. If new avatar is uploaded, old avatar is deleted from cloud storage. If name changes, slug is auto-regenerated.",
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
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  name: {
                    type: "string",
                    minLength: 2,
                    maxLength: 100,
                  },
                  bio: {
                    type: "string",
                    maxLength: 2000,
                    nullable: true,
                  },
                  avatar: {
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
            description: "Teacher updated successfully.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    message: "مدرس با موفقیت ویرایش شد",
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
  - Max length: 100.

- bio:
  - Optional.
  - Must be a string or null.
  - Max length: 2000.
  - Send null to remove biography.

- avatar:
  - Optional.
  - Max size: 2 MB.
  - Allowed formats: .jpg, .jpeg, .png, .webp.

- At least one field is required.
- Duplicate name may also return 400.`,
          },
          401: { description: "Unauthorized: Invalid or expired token." },
          403: { description: "Forbidden: Admin access required." },
          404: { description: "Teacher not found." },
        },
      },
      delete: {
        tags: ["Teacher"],
        summary: "Delete a teacher (Admin)",
        description:
          "Permanently deletes a teacher and their avatar from cloud storage. **Cannot delete a teacher who has courses assigned.** First reassign or delete their courses.",
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
            description: "Teacher deleted successfully.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    message: "مدرس با موفقیت حذف شد",
                  },
                },
              },
            },
          },
          400: {
            description: "Teacher has courses assigned.",
            content: {
              "application/json": {
                example: {
                  status: "error",
                  message:
                    "این مدرس ۳ دوره دارد. ابتدا دوره‌ها را حذف یا به مدرس دیگری منتقل کنید",
                  code: 400,
                },
              },
            },
          },
          401: { description: "Unauthorized: Invalid or expired token." },
          403: { description: "Forbidden: Admin access required." },
          404: { description: "Teacher not found." },
        },
      },
    },
  },
};
