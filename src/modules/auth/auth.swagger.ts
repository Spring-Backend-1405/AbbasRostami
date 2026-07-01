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
    "/api/auth/forgot-password": {
      post: {
        tags: ["Auth"],
        summary: "Request password reset code (STEP 1)",
        description:
          "Sends a 6-digit reset code to the user's email. Returns generic message regardless of whether email exists (security).",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email"],
                properties: {
                  email: {
                    type: "string",
                    format: "email",
                    example: "user@example.com",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "درخواست ثبت شد.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    message:
                      "اگر این ایمیل در سیستم وجود داشته باشد، کد بازیابی ارسال شد",
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
                  data: { email: "ایمیل وارد شده معتبر نیست" },
                },
              },
            },
          },
          429: {
            description: "Rate limit exceeded (3 requests per hour)",
            content: {
              "application/json": {
                example: {
                  status: "fail",
                  data: {
                    message:
                      "تعداد درخواست‌ها بیش از حد. لطفاً ۱ ساعت دیگر تلاش کنید.",
                  },
                },
              },
            },
          },
        },
      },
    },
    "/api/auth/reset-password": {
      post: {
        tags: ["Auth"],
        summary: "Reset password with code (STEP 2)",
        description:
          "Resets user's password using the code received via email. After success, all active sessions are invalidated.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "code", "newPassword"],
                properties: {
                  email: {
                    type: "string",
                    format: "email",
                    example: "user@example.com",
                  },
                  code: {
                    type: "string",
                    length: 6,
                    example: "123456",
                  },
                  newPassword: {
                    type: "string",
                    minLength: 6,
                    example: "newSecurePass123",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "رمز با موفقیت تغییر یافت.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    message:
                      "رمز عبور شما با موفقیت تغییر یافت. لطفاً مجدداً وارد شوید",
                  },
                },
              },
            },
          },
          400: {
            description: "Invalid code, expired, or validation error",
            content: {
              "application/json": {
                examples: {
                  invalidCode: {
                    summary: "کد اشتباه",
                    value: {
                      status: "fail",
                      data: { code: "کد وارد شده صحیح نیست" },
                    },
                  },
                  expiredCode: {
                    summary: "کد منقضی",
                    value: {
                      status: "fail",
                      data: { code: "کد منقضی شده است، دوباره درخواست دهید" },
                    },
                  },
                  noRequest: {
                    summary: "بدون درخواست قبلی",
                    value: {
                      status: "fail",
                      data: { code: "ابتدا درخواست بازیابی رمز عبور دهید" },
                    },
                  },
                },
              },
            },
          },
          429: {
            description: "Rate limit exceeded (5 attempts per 15 min)",
          },
        },
      },
    },
    "/api/auth/resend-verification": {
      post: {
        tags: ["Auth"],
        summary: "Resend email verification code",
        description:
          "Resends a new 6-digit verification code to user's email. Returns generic message regardless of email existence. Rate limited: 3 per 5 min.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email"],
                properties: {
                  email: {
                    type: "string",
                    format: "email",
                    example: "user@example.com",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "درخواست ثبت شد.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    message:
                      "اگر این ایمیل در سیستم وجود داشته باشد، کد ارسال شد",
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
                  data: { email: "ایمیل وارد شده معتبر نیست" },
                },
              },
            },
          },
          429: {
            description: "Rate limit exceeded (3 per 5 min)",
          },
        },
      },
    },

    "/api/auth/resend-reset-code": {
      post: {
        tags: ["Auth"],
        summary: "Resend reset password code",
        description:
          "Resends a new reset password code. User must have requested forgot-password first. Rate limited: 3 per 5 min.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email"],
                properties: {
                  email: {
                    type: "string",
                    format: "email",
                    example: "user@example.com",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "درخواست ثبت شد.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    message:
                      "اگر این ایمیل در سیستم وجود داشته باشد، کد ارسال شد",
                  },
                },
              },
            },
          },
          400: {
            description: "بدون درخواست reset قبلی",
            content: {
              "application/json": {
                example: {
                  status: "error",
                  message: "ابتدا درخواست بازیابی رمز عبور دهید",
                  code: 400,
                },
              },
            },
          },
          429: {
            description: "Rate limit exceeded (3 per 5 min)",
          },
        },
      },
    },
    "/api/auth/change-password": {
      post: {
        tags: ["Auth"],
        summary: "Change password (requires login)",
        description: `Changes the authenticated user's password.

**Security:**
- User must be logged in
- Must provide current password for verification
- All active sessions are invalidated after change
- User must login again with new password`,
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["currentPassword", "newPassword"],
                properties: {
                  currentPassword: {
                    type: "string",
                    example: "oldPassword123",
                    description: "رمز عبور فعلی برای تایید",
                  },
                  newPassword: {
                    type: "string",
                    minLength: 6,
                    example: "newSecurePass123",
                    description: "رمز عبور جدید (حداقل ۶ کاراکتر)",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "رمز با موفقیت تغییر یافت.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    message:
                      "رمز عبور با موفقیت تغییر یافت. لطفاً مجدداً وارد شوید",
                  },
                },
              },
            },
          },
          400: {
            description: "Validation error or wrong current password",
            content: {
              "application/json": {
                examples: {
                  wrongPassword: {
                    summary: "رمز فعلی اشتباه",
                    value: {
                      status: "fail",
                      data: {
                        currentPassword: "رمز عبور فعلی صحیح نیست",
                      },
                    },
                  },
                  samePassword: {
                    summary: "رمز جدید مثل رمز فعلی",
                    value: {
                      status: "fail",
                      data: {
                        newPassword:
                          "رمز عبور جدید نباید با رمز فعلی یکسان باشد",
                      },
                    },
                  },
                  tooShort: {
                    summary: "رمز کوتاه",
                    value: {
                      status: "fail",
                      data: {
                        newPassword: "رمز عبور جدید باید حداقل ۶ کاراکتر باشد",
                      },
                    },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized: Invalid or expired token." },
          404: { description: "User not found." },
        },
      },
    },
    "/api/auth/request-change-email": {
      post: {
        tags: ["Auth"],
        summary: "Request email change - requires login (STEP 1)",
        description: `Requests to change user's email.
  
  **Flow:**
  1. User provides new email + current password
  2. Backend validates password
  3. Backend sends 6-digit code to the **new** email
  4. User calls verify-change-email with the code
  5. Email is changed and all sessions are logged out
  
  **Security:**
  - Requires current password
  - Code sent to NEW email (proves ownership)
  - All sessions logged out after change
  - Rate limited: 3 per hour`,
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["newEmail", "password"],
                properties: {
                  newEmail: {
                    type: "string",
                    format: "email",
                    example: "new@example.com",
                  },
                  password: {
                    type: "string",
                    example: "currentPassword123",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "کد به ایمیل جدید ارسال شد.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    message: "کد تایید به ایمیل جدید شما ارسال شد",
                    newEmail: "new@example.com",
                  },
                },
              },
            },
          },
          400: {
            description: "Validation error or password mismatch",
            content: {
              "application/json": {
                examples: {
                  wrongPassword: {
                    summary: "رمز اشتباه",
                    value: {
                      status: "fail",
                      data: { password: "رمز عبور صحیح نیست" },
                    },
                  },
                  sameEmail: {
                    summary: "همون ایمیل فعلی",
                    value: {
                      status: "fail",
                      data: { newEmail: "ایمیل جدید همان ایمیل فعلی است" },
                    },
                  },
                  taken: {
                    summary: "ایمیل گرفته شده",
                    value: {
                      status: "fail",
                      data: {
                        newEmail: "کاربر دیگری با این ایمیل ثبت‌نام کرده است",
                      },
                    },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized: Invalid or expired token." },
          429: { description: "Rate limit exceeded (3 per hour)." },
        },
      },
    },

    "/api/auth/verify-change-email": {
      post: {
        tags: ["Auth"],
        summary: "Verify email change with code (STEP 2)",
        description:
          "Verifies the code sent to the new email. On success, email is changed and all sessions are logged out.",
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["code"],
                properties: {
                  code: {
                    type: "string",
                    length: 6,
                    example: "123456",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "ایمیل تغییر کرد.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    message:
                      "ایمیل شما با موفقیت تغییر یافت. لطفاً مجدداً وارد شوید",
                    newEmail: "new@example.com",
                  },
                },
              },
            },
          },
          400: {
            description: "Invalid code or expired",
            content: {
              "application/json": {
                examples: {
                  invalidCode: {
                    summary: "کد اشتباه",
                    value: {
                      status: "fail",
                      data: { code: "کد وارد شده صحیح نیست" },
                    },
                  },
                  expiredCode: {
                    summary: "کد منقضی",
                    value: {
                      status: "fail",
                      data: { code: "کد منقضی شده است، دوباره درخواست دهید" },
                    },
                  },
                  noRequest: {
                    summary: "بدون درخواست قبلی",
                    value: {
                      status: "fail",
                      data: { code: "ابتدا درخواست تغییر ایمیل دهید" },
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
  },
};
