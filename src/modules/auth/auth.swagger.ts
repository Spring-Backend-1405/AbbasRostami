export const authSwagger = {
  paths: {
    "/api/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new account (STEP 1)",
        description: `Creates an unverified account and sends a 6-digit OTP code to the email.

**OTP Details:**
- Code length: 6 digits
- Validity: **2 minutes**
- Delivery: Email

**Smart Retry Logic:**
- If user exists and **verified**: Returns 400 error
- If user exists but **not verified** and OTP is still valid: Returns error asking to use existing code or resend
- If user exists but **not verified** and OTP expired: Updates password/name and sends new code
- If user is banned: Returns 403 error

**Rate Limits:**
- Per IP: 20 requests per 1 hour
- Per Email: 5 requests per 1 hour`,
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
            description:
              "Registered successfully. OTP code sent to email (valid for 2 minutes).",
            content: {
              "application/json": {
                examples: {
                  newUser: {
                    summary: "New user registration",
                    value: {
                      status: "success",
                      data: {
                        email: "abbas@example.com",
                        message: "کد تایید به ایمیل شما ارسال شد",
                      },
                    },
                  },
                  updatedUser: {
                    summary: "Existing unverified user (OTP expired)",
                    value: {
                      status: "success",
                      data: {
                        email: "abbas@example.com",
                        message: "کد تایید جدید به ایمیل شما ارسال شد",
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: `Invalid request - Validation rules:

- **email:**
  - Must not be empty.
  - Must be a valid email address.

- **password:**
  - Must not be empty.
  - Must be a string.
  - Min length: 6.

- **name:**
  - Optional.
  - Must be a string.

**Business errors:**
- Email already verified (user already registered).
- Previous OTP still valid (2 minutes cooldown).`,
            content: {
              "application/json": {
                examples: {
                  emailExists: {
                    summary: "Email already registered (verified)",
                    value: {
                      status: "fail",
                      data: {
                        email: "کاربری با این ایمیل قبلاً ثبت‌ نام کرده است",
                      },
                    },
                  },
                  otpStillValid: {
                    summary: "Previous OTP still valid",
                    value: {
                      status: "fail",
                      data: {
                        email:
                          "کد تایید قبلی هنوز معتبر است. لطفاً ایمیل خود را بررسی کنید یا از گزینه «ارسال مجدد کد» استفاده کنید",
                      },
                    },
                  },
                },
              },
            },
          },
          403: {
            description: "Account is banned.",
            content: {
              "application/json": {
                example: {
                  status: "fail",
                  data: {
                    message: "این حساب کاربری مسدود شده است",
                  },
                },
              },
            },
          },
          429: {
            description: "Rate limit exceeded.",
            content: {
              "application/json": {
                examples: {
                  ipLimit: {
                    summary: "IP-based limit (20 per hour)",
                    value: {
                      status: "fail",
                      data: {
                        message:
                          "تعداد درخواست‌های ثبت‌نام از این IP بیش از حد مجاز است. لطفاً 1 ساعت دیگر تلاش کنید.",
                      },
                    },
                  },
                  emailLimit: {
                    summary: "Email-based limit (5 per hour)",
                    value: {
                      status: "fail",
                      data: {
                        message:
                          "تعداد درخواست‌های ثبت‌نام برای این ایمیل بیش از حد مجاز است. لطفاً 1 ساعت دیگر تلاش کنید.",
                      },
                    },
                  },
                },
              },
            },
          },
          500: {
            description: "Email sending failed.",
            content: {
              "application/json": {
                example: {
                  status: "error",
                  message:
                    "ارسال ایمیل تایید ناموفق بود. لطفاً دوباره تلاش کنید.",
                  code: 500,
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
        summary: "Verify OTP code & Auto-Login (STEP 2)",
        description: `Validates the 6-digit email code and auto-logs in the user.

**OTP Validity:** 2 minutes from generation.

**On Success:**
- Sets HTTP-Only cookies (accessToken + refreshToken)
- Returns accessToken in response body
- Marks user as verified`,
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
            description: "Email verified successfully. User logged in.",
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
            description: `Invalid request - Validation rules:

- **email:**
  - Must not be empty.
  - Must be a valid email address.

- **code:**
  - Must not be empty.
  - Must be exactly 6 characters.

**Business errors:**
- Invalid code.
- Code expired (older than 2 minutes).
- No pending verification for this email.`,
            content: {
              "application/json": {
                examples: {
                  invalidCode: {
                    summary: "Wrong code",
                    value: {
                      status: "fail",
                      data: { message: "کد تایید اشتباه است" },
                    },
                  },
                  expiredCode: {
                    summary: "Code expired (>2 min)",
                    value: {
                      status: "fail",
                      data: {
                        code: "کد تایید منقضی شده است، لطفاً مجدداً ثبت‌نام کنید",
                      },
                    },
                  },
                },
              },
            },
          },
          403: {
            description: "Account is banned.",
            content: {
              "application/json": {
                example: {
                  status: "fail",
                  data: { message: "حساب کاربری شما مسدود شده است" },
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
        description: `Authenticates credentials and issues session cookies.

**Rate Limit:** 5 failed attempts per 15 minutes.`,
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
            description: "User logged in successfully.",
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
          400: {
            description: `Invalid request - Validation rules:

- **email:**
  - Must not be empty.
  - Must be a valid email address.

- **password:**
  - Must not be empty.`,
          },
          401: {
            description: "Email or password is incorrect.",
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
            description: "Account is not verified or banned.",
            content: {
              "application/json": {
                examples: {
                  notVerified: {
                    summary: "Email not verified",
                    value: {
                      status: "fail",
                      data: {
                        message:
                          "حساب کاربری شما هنوز تایید نشده است. ابتدا ایمیل خود را تایید کنید",
                      },
                    },
                  },
                  banned: {
                    summary: "Account banned",
                    value: {
                      status: "fail",
                      data: { message: "حساب کاربری شما مسدود شده است" },
                    },
                  },
                },
              },
            },
          },
          429: {
            description: "Rate limit exceeded (5 failed attempts per 15 min).",
            content: {
              "application/json": {
                example: {
                  status: "fail",
                  data: {
                    message:
                      "تعداد تلاش‌های ناموفق برای ورود بیش از حد مجاز است. لطفاً 15 دقیقه دیگر تلاش کنید.",
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
        description: `Extracts refreshToken automatically from cookies and issues new access + refresh tokens.

**Token Validity:**
- Access Token: 15 minutes
- Refresh Token: 7 days`,
        responses: {
          200: {
            description: "Access token refreshed successfully.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    message: "تمدید موفق",
                    accessToken: "eyJhbGciOi...",
                  },
                },
              },
            },
          },
          401: {
            description: "Refresh token missing, invalid, or expired.",
            content: {
              "application/json": {
                examples: {
                  missing: {
                    summary: "Token missing",
                    value: {
                      status: "fail",
                      data: { message: "توکن نوسازی یافت نشد" },
                    },
                  },
                  invalid: {
                    summary: "Token invalid/expired",
                    value: {
                      status: "fail",
                      data: {
                        message:
                          "نشست شما منقضی شده است، لطفا دوباره وارد شوید",
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    "/api/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Logout user",
        description:
          "Clears server tokens and cookie storage. Always returns success even if no active session.",
        responses: {
          200: {
            description: "User logged out successfully.",
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
        description: `Sends a 6-digit reset code to the user's email.

**OTP Validity:** 2 minutes.
**Rate Limit:** 3 requests per hour.

**Security:** Returns generic message regardless of whether email exists (prevents email enumeration).`,
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
            description: "Request submitted successfully.",
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
            description: `Invalid request - Validation rules:

- **email:**
  - Must not be empty.
  - Must be a valid email address.`,
          },
          429: {
            description: "Rate limit exceeded (3 requests per hour).",
            content: {
              "application/json": {
                example: {
                  status: "fail",
                  data: {
                    message:
                      "تعداد درخواست‌های بازیابی رمز عبور بیش از حد مجاز است. لطفاً 1 ساعت دیگر تلاش کنید.",
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
        description: `Resets user's password using the code received via email.

**OTP Validity:** 2 minutes.
**Rate Limit:** 5 attempts per 15 minutes.

**After success:** All active sessions are invalidated. User must login again.`,
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
            description: "Password changed successfully.",
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
            description: `Invalid request - Validation rules:

- **email:**
  - Must not be empty.
  - Must be a valid email address.

- **code:**
  - Must not be empty.
  - Must be exactly 6 characters.

- **newPassword:**
  - Must not be empty.
  - Must be a string.
  - Min length: 6.

**Business errors:**
- Invalid code.
- Code expired (older than 2 minutes).
- No prior forgot-password request.`,
            content: {
              "application/json": {
                examples: {
                  noRequest: {
                    summary: "No prior forgot-password request",
                    value: {
                      status: "fail",
                      data: { code: "ابتدا درخواست بازیابی رمز عبور دهید" },
                    },
                  },
                  expired: {
                    summary: "Code expired",
                    value: {
                      status: "fail",
                      data: { code: "کد منقضی شده است، دوباره درخواست دهید" },
                    },
                  },
                  invalid: {
                    summary: "Invalid code",
                    value: {
                      status: "fail",
                      data: { code: "کد وارد شده صحیح نیست" },
                    },
                  },
                },
              },
            },
          },
          429: {
            description: "Rate limit exceeded (5 attempts per 15 min).",
            content: {
              "application/json": {
                example: {
                  status: "fail",
                  data: {
                    message:
                      "تعداد تلاش‌های ناموفق برای بازیابی رمز بیش از حد مجاز است. لطفاً 15 دقیقه دیگر تلاش کنید.",
                  },
                },
              },
            },
          },
        },
      },
    },

    "/api/auth/resend-verification": {
      post: {
        tags: ["Auth"],
        summary: "Resend email verification code",
        description: `Resends a new 6-digit verification code to user's email.

**OTP Validity:** 2 minutes.
**Rate Limit:** 5 requests per 10 minutes.

**Security:** Returns generic message regardless of email existence.`,
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
            description: "Request submitted successfully.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    message: "کد تایید مجدداً به ایمیل ارسال شد",
                  },
                },
              },
            },
          },
          400: {
            description: `Invalid request - Validation rules:

- **email:**
  - Must not be empty.
  - Must be a valid email address.`,
          },
          429: {
            description: "Rate limit exceeded (5 per 10 min).",
            content: {
              "application/json": {
                example: {
                  status: "fail",
                  data: {
                    message:
                      "تعداد درخواست‌های ارسال مجدد کد تایید بیش از حد مجاز است. لطفاً 10 دقیقه دیگر تلاش کنید.",
                  },
                },
              },
            },
          },
        },
      },
    },

    "/api/auth/resend-reset-code": {
      post: {
        tags: ["Auth"],
        summary: "Resend reset password code",
        description: `Resends a new reset password code.

**OTP Validity:** 2 minutes.
**Rate Limit:** 5 requests per 10 minutes.

**Prerequisite:** User must have requested forgot-password first.`,
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
            description: "Request submitted successfully.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    message: "کد تایید مجدداً به ایمیل ارسال شد",
                  },
                },
              },
            },
          },
          400: {
            description: `Invalid request - Validation rules:

- **email:**
  - Must not be empty.
  - Must be a valid email address.

**Business errors:**
- User must have a prior forgot-password request.`,
          },
          429: {
            description: "Rate limit exceeded (5 per 10 min).",
            content: {
              "application/json": {
                example: {
                  status: "fail",
                  data: {
                    message:
                      "تعداد درخواست‌های ارسال مجدد کد بازیابی بیش از حد مجاز است. لطفاً 10 دقیقه دیگر تلاش کنید.",
                  },
                },
              },
            },
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
            description: "Password changed successfully.",
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
            description: `Invalid request - Validation rules:

- **currentPassword:**
  - Must not be empty.
  - Must match the user's current password.

- **newPassword:**
  - Must not be empty.
  - Must be a string.
  - Min length: 6.
  - Must not be the same as currentPassword.`,
            content: {
              "application/json": {
                example: {
                  status: "fail",
                  data: {
                    currentPassword: "رمز عبور فعلی صحیح نیست",
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

**OTP Validity:** 2 minutes.
**Rate Limit:** 3 requests per hour.`,
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
            description: "Code sent to the new email.",
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
            description: `Invalid request - Validation rules:

- **newEmail:**
  - Must not be empty.
  - Must be a valid email address.
  - Must not be the same as current email.
  - Must not already be registered by another user.

- **password:**
  - Must not be empty.
  - Must match the user's current password.`,
            content: {
              "application/json": {
                examples: {
                  sameEmail: {
                    summary: "Same as current email",
                    value: {
                      status: "fail",
                      data: {
                        newEmail: "ایمیل جدید همان ایمیل فعلی است",
                      },
                    },
                  },
                  emailTaken: {
                    summary: "Email already used",
                    value: {
                      status: "fail",
                      data: {
                        newEmail: "کاربر دیگری با این ایمیل ثبت‌نام کرده است",
                      },
                    },
                  },
                  wrongPassword: {
                    summary: "Wrong password",
                    value: {
                      status: "fail",
                      data: {
                        password: "رمز عبور صحیح نیست",
                      },
                    },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized: Invalid or expired token." },
          404: { description: "User not found." },
          429: {
            description: "Rate limit exceeded (3 per hour).",
            content: {
              "application/json": {
                example: {
                  status: "fail",
                  data: {
                    message:
                      "تعداد درخواست‌های تغییر ایمیل بیش از حد مجاز است. لطفاً 1 ساعت دیگر تلاش کنید.",
                  },
                },
              },
            },
          },
        },
      },
    },

    "/api/auth/verify-change-email": {
      post: {
        tags: ["Auth"],
        summary: "Verify email change with code (STEP 2)",
        description: `Verifies the code sent to the new email.

**OTP Validity:** 2 minutes.

**On Success:**
- Email is changed to the new one
- All active sessions are invalidated
- User must login again`,
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
            description: "Email successfully changed.",
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
            description: `Invalid request - Validation rules:

- **code:**
  - Must not be empty.
  - Must be exactly 6 characters.

**Business errors:**
- No prior change email request.
- Code expired (older than 2 minutes).
- Invalid code.
- Email taken by another user during the process.`,
            content: {
              "application/json": {
                examples: {
                  noRequest: {
                    summary: "No prior change email request",
                    value: {
                      status: "fail",
                      data: { code: "ابتدا درخواست تغییر ایمیل دهید" },
                    },
                  },
                  expired: {
                    summary: "Code expired",
                    value: {
                      status: "fail",
                      data: { code: "کد منقضی شده است، دوباره درخواست دهید" },
                    },
                  },
                  invalid: {
                    summary: "Invalid code",
                    value: {
                      status: "fail",
                      data: { code: "کد وارد شده صحیح نیست" },
                    },
                  },
                  emailTaken: {
                    summary: "Email taken during process",
                    value: {
                      status: "fail",
                      data: {
                        message:
                          "این ایمیل در فاصله درخواست تا تایید توسط شخص دیگری ثبت شده است",
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

    "/api/auth/resend-change-email-code": {
      post: {
        tags: ["Auth"],
        summary: "Resend change email verification code",
        description: `Resends the 6-digit verification code to the pending new email.

**OTP Validity:** 2 minutes.
**Rate Limit:** 5 requests per 10 minutes.

**Prerequisite:** User must have already requested email change.`,
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        responses: {
          200: {
            description: "Code resent successfully.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    message: "کد تایید مجدداً به ایمیل جدید ارسال شد",
                    newEmail: "new@example.com",
                  },
                },
              },
            },
          },
          400: {
            description: `Invalid request - Validation rules:

- User must have a pending email change request.
- No body fields required (user is identified by auth token).`,
            content: {
              "application/json": {
                example: {
                  status: "fail",
                  data: { message: "ابتدا درخواست تغییر ایمیل دهید" },
                },
              },
            },
          },
          401: { description: "Unauthorized: Invalid or expired token." },
          404: { description: "User not found." },
          429: {
            description: "Rate limit exceeded (5 per 10 min).",
            content: {
              "application/json": {
                example: {
                  status: "fail",
                  data: {
                    message:
                      "تعداد درخواست‌های ارسال مجدد کد تغییر ایمیل بیش از حد مجاز است. لطفاً 10 دقیقه دیگر تلاش کنید.",
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};
