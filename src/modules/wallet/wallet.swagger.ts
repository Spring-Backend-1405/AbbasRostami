export const walletSwagger = {
  paths: {
    "/api/wallet": {
      get: {
        tags: ["Wallet"],
        summary: "Get user's wallet balance",
        description:
          "Returns the authenticated user's wallet. If wallet doesn't exist, it's created automatically with balance 0.",
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        responses: {
          200: {
            description: "موجودی کیف پول با موفقیت دریافت شد.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    wallet: {
                      id: "wallet-uuid",
                      balance: 100000,
                      userId: "user-uuid",
                      updatedAt: "2026-01-15T14:00:00.000Z",
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

    "/api/wallet/charge": {
      post: {
        tags: ["Wallet"],
        summary: "Initiate wallet charge via ZarinPal",
        description: `
Creates a PENDING transaction and returns ZarinPal payment URL.

## فلوی کامل پرداخت برای فرانت:

1. **Front-End:** POST /api/wallet/charge -  به همراه مبلغ

2. **Backend:** \`paymentUrl\` برمی‌گرداند

3. **Front-End:** \`window.location.href = paymentUrl\` (کاربر به زرین پال می‌رود)

4. **User:** در زرین پال پرداخت می‌کند

5. **ZarinPal:** کاربر را به Backend می‌فرستد (داخلی)

6. **Backend:** verify می‌کند و موجودی را شارژ می‌کند

7. **Backend:** کاربر را به فرانت ریدایرکت می‌کند:
   - **موفق:** \`{FRONTEND_URL}/payment/success?status=success&refId=X&amount=Y&newBalance=Z&transactionId=T\`

   - **ناموفق:** \`{FRONTEND_URL}/payment/failed?status=failed&reason=Z&authority=X\`

## صفحات لازم در فرانت:
- \`/payment/success\` - نمایش پیام موفقیت با اطلاعات تراکنش

- \`/payment/failed\` - نمایش پیام خطا با دلیل
        `,
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["amount"],
                properties: {
                  amount: {
                    type: "integer",
                    minimum: 10000,
                    maximum: 500000000,
                    example: 1000000,
                    description:
                      "مبلغ به ریال (حداقل 10,000 - حداکثر 500,000,000)",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "درخواست پرداخت ایجاد شد.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    message: "لطفاً برای پرداخت به آدرس زیر مراجعه کنید",
                    paymentUrl:
                      "https://sandbox.zarinpal.com/pg/StartPay/S0000000000000000000000000000xxxxxx",
                    transactionId: "tx-uuid",
                    authority: "S0000000000000000000000000000xxxxxx",
                  },
                },
              },
            },
          },
          400: {
            description: "Validation error",
            content: {
              "application/json": {
                examples: {
                  notANumber: {
                    summary: "مبلغ string",
                    value: {
                      status: "fail",
                      data: { amount: "مبلغ باید عدد باشد" },
                    },
                  },
                  tooLow: {
                    summary: "مبلغ خیلی کم",
                    value: {
                      status: "fail",
                      data: {
                        amount: "حداقل مبلغ شارژ ۱۰،۰۰۰ ریال (۱،۰۰۰ تومان) است",
                      },
                    },
                  },
                  tooHigh: {
                    summary: "مبلغ خیلی زیاد",
                    value: {
                      status: "fail",
                      data: {
                        amount:
                          "حداکثر مبلغ شارژ ۵۰۰،۰۰۰،۰۰۰ ریال (۵۰ میلیون تومان) است",
                      },
                    },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized: Invalid or expired token." },
          500: {
            description: "خطا در ارتباط با ZarinPal",
            content: {
              "application/json": {
                example: {
                  status: "error",
                  message: "خطا در ارتباط با درگاه پرداخت",
                  code: 500,
                },
              },
            },
          },
        },
      },
    },

    "/api/wallet/transactions": {
      get: {
        tags: ["Wallet"],
        summary: "Get user's transaction history",
        description:
          "Returns the authenticated user's transactions with filters and pagination.",
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
            name: "status",
            in: "query",
            schema: {
              type: "string",
              enum: ["PENDING", "SUCCESS", "FAILED", "CANCELLED"],
            },
            description: "فیلتر بر اساس وضعیت",
          },
          {
            name: "type",
            in: "query",
            schema: {
              type: "string",
              enum: ["CHARGE", "PURCHASE", "REFUND"],
            },
            description: "فیلتر بر اساس نوع تراکنش",
          },
        ],
        responses: {
          200: {
            description: "تاریخچه تراکنش‌ها.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    items: [
                      {
                        id: "tx-uuid-1",
                        amount: 1000000,
                        status: "SUCCESS",
                        type: "CHARGE",
                        description: "شارژ کیف پول",
                        refId: "12345678",
                        course: null,
                        createdAt: "2026-01-15T14:00:00.000Z",
                      },
                      {
                        id: "tx-uuid-2",
                        amount: 800000,
                        status: "SUCCESS",
                        type: "PURCHASE",
                        description: "پرداخت سفارش #b09dc6c8",
                        course: null,
                        createdAt: "2026-01-14T15:00:00.000Z",
                      },
                    ],
                    pagination: { page: 1, limit: 10, total: 25 },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized: Invalid or expired token." },
        },
      },
    },

    "/api/wallet/admin/wallets": {
      get: {
        tags: ["Wallet"],
        summary: "Get all wallets (Admin)",
        description:
          "Returns all users' wallets with filters and pagination. Admin access required.",
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
            schema: { type: "string", example: "20" },
            description: "limit",
          },
          {
            name: "minBalance",
            in: "query",
            schema: { type: "string", example: "100000" },
            description: "حداقل موجودی (به ریال)",
          },
          {
            name: "maxBalance",
            in: "query",
            schema: { type: "string", example: "10000000" },
            description: "حداکثر موجودی (به ریال)",
          },
          {
            name: "search",
            in: "query",
            schema: { type: "string", example: "ali" },
            description: "جستجو در email یا نام کاربر",
          },
        ],
        responses: {
          200: {
            description: "لیست کیف‌پول‌ها.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    items: [
                      {
                        id: "wallet-uuid",
                        balance: 5000000,
                        userId: "user-uuid",
                        user: {
                          id: "user-uuid",
                          email: "ali@example.com",
                          name: "علی رضایی",
                          phone: "09121234567",
                        },
                        updatedAt: "2026-01-15T14:00:00.000Z",
                      },
                    ],
                    pagination: { page: 1, limit: 20, total: 150 },
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

    "/api/wallet/admin/transactions": {
      get: {
        tags: ["Wallet"],
        summary: "Get all transactions (Admin)",
        description:
          "Returns all transactions across the platform with powerful filters. Admin access required.",
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
            schema: { type: "string", example: "20" },
            description: "limit",
          },
          {
            name: "status",
            in: "query",
            schema: {
              type: "string",
              enum: ["PENDING", "SUCCESS", "FAILED", "CANCELLED"],
            },
            description: "فیلتر بر اساس وضعیت",
          },
          {
            name: "type",
            in: "query",
            schema: {
              type: "string",
              enum: ["CHARGE", "PURCHASE", "REFUND"],
            },
            description: "فیلتر بر اساس نوع",
          },
          {
            name: "userId",
            in: "query",
            schema: { type: "string", format: "uuid" },
            description: "تراکنش‌های یک کاربر خاص",
          },
          {
            name: "startDate",
            in: "query",
            schema: { type: "string", format: "date-time" },
            description: "از تاریخ (ISO 8601)",
          },
          {
            name: "endDate",
            in: "query",
            schema: { type: "string", format: "date-time" },
            description: "تا تاریخ (ISO 8601)",
          },
        ],
        responses: {
          200: {
            description: "لیست همه تراکنش‌ها با pagination.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    items: [
                      {
                        id: "tx-uuid",
                        amount: 1000000,
                        status: "SUCCESS",
                        type: "CHARGE",
                        authority: "S0000...",
                        refId: "12345678",
                        description: "شارژ کیف پول",
                        userId: "user-uuid",
                        user: {
                          id: "user-uuid",
                          email: "ali@example.com",
                          name: "علی",
                        },
                        course: null,
                        createdAt: "2026-01-15T14:00:00.000Z",
                      },
                    ],
                    pagination: { page: 1, limit: 20, total: 500 },
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
  },
};
