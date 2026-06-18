export const authSwagger = {
  paths: {
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new account",
        description:
          "Creates an unverified account and triggers a 6-digit OTP code to the email.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: {
                    type: "string",
                    format: "email",
                    example: "abbas@example.com",
                  },
                  password: { type: "string", minLength: 6, example: "123456" },
                  name: { type: "string", example: "عباس رستمی" },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "ثبت‌نام اولیه موفقیت‌آمیز بود و ایمیل ارسال شد.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    email: "abbas@example.com",
                    message: "کد تایید به ایمیل شما ارسال شد",
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
                    email: "کاربری با این ایمیل قبلاً ثبت‌نام کرده است",
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/auth/verify-email": {
      post: {
        tags: ["Auth"],
        summary: "Verify OTP code & Auto-Login",
        description:
          "Validates the 6-digit email code. Sets HTTP-Only cookies on success.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "code"],
                properties: {
                  email: {
                    type: "string",
                    format: "email",
                    example: "abbas@example.com",
                  },
                  code: { type: "string", length: 6, example: "123456" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "ایمیل تایید شد و کوکی‌های سشن ست شدند.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    message:
                      "ایمیل شما با موفقیت تایید شد و وارد حساب خود شدید",
                    accessToken: "eyJhbGciOi...",
                    user: {
                      id: "d3b07384-d113-4956-a5cc-484443028456",
                      email: "abbas@example.com",
                      name: "عباس رستمی",
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "خطای اشتباه بودن کد یا منقضی شدن آن.",
            content: {
              "application/json": {
                example: {
                  status: "fail",
                  data: {
                    code: "کد تایید اشتباه است",
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "User authentication",
        description: "Authenticates credentials and issues session cookies.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: {
                    type: "string",
                    format: "email",
                    example: "abbas@example.com",
                  },
                  password: { type: "string", example: "123456" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "ورود موفقیت‌آمیز.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    message: "ورود با موفقیت انجام شد",
                    accessToken: "eyJhbGciOi...",
                    user: {
                      id: "d3b07384-d113-4956-a5cc-484443028456",
                      email: "abbas@example.com",
                      name: "عباس رستمی",
                    },
                  },
                },
              },
            },
          },
          401: {
            description: "اشتباه بودن اطلاعات ورود",
            content: {
              "application/json": {
                example: {
                  status: "fail",
                  data: { message: "ایمیل یا رمز عبور اشتباه است" },
                },
              },
            },
          },
          403: {
            description: "حساب کاربری فعال نشده است.",
            content: {
              "application/json": {
                example: {
                  status: "fail",
                  data: {
                    message:
                      "حساب کاربری شما هنوز تایید نشده است. ابتدا ایمیل خود را تایید کنید",
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/auth/refresh": {
      post: {
        tags: ["Auth"],
        summary: "Refresh active session token",
        description:
          "Extracts `refreshToken` automatically from cookies and updates access tokens.",
        responses: {
          200: {
            description: "توکن با موفقیت تمدید شد.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    message: "توکن شما با موفقیت تمدید شد",
                    accessToken: "eyJhbGciOi...",
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized: Invalid or expired token." },
        },
      },
    },
    "/api/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Logout user",
        description: "Clears server tokens and cookie storage.",
        responses: {
          200: {
            description: "خروج با موفقیت انجام شد.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: { message: "خروج با موفقیت انجام شد" },
                },
              },
            },
          },
        },
      },
    },
  },
};
