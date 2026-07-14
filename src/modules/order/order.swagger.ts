export const orderSwagger = {
  paths: {
    "/api/orders/checkout/wallet": {
      post: {
        tags: ["Order"],
        summary: "Checkout with wallet",
        description:
          "Creates an order from the user's cart and pays using wallet balance. On success: order is PAID, enrollments are created, cart is cleared.",
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        responses: {
          200: {
            description: "Payment completed successfully.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    message: "پرداخت با موفقیت انجام شد",
                    order: {
                      id: "order-uuid",
                      totalAmount: 800000,
                      status: "PAID",
                      paymentMethod: "WALLET",
                      createdAt: "2026-01-15T14:00:00.000Z",
                      updatedAt: "2026-01-15T14:00:05.000Z",
                      items: [
                        {
                          id: "item-uuid-1",
                          courseId: "course-uuid-1",
                          courseTitle: "آموزش React پیشرفته",
                          courseSlug: "react-advanced",
                          courseImageUrl: "/uploads/courses/react.jpg",
                          price: 500000,
                          createdAt: "2026-01-15T14:00:00.000Z",
                        },
                        {
                          id: "item-uuid-2",
                          courseId: "course-uuid-2",
                          courseTitle: "آموزش Node.js",
                          courseSlug: "node-advanced",
                          courseImageUrl: "/uploads/courses/node.jpg",
                          price: 300000,
                          createdAt: "2026-01-15T14:00:00.000Z",
                        },
                      ],
                    },
                    newBalance: 200000,
                  },
                },
              },
            },
          },
          400: {
            description:
              "Cart is empty, insufficient balance, or course is unavailable.",
            content: {
              "application/json": {
                examples: {
                  emptyCart: {
                    summary: "سبد خالی",
                    value: {
                      status: "error",
                      message: "سبد خرید خالی است",
                      code: 400,
                    },
                  },
                  insufficientBalance: {
                    summary: "موجودی ناکافی",
                    value: {
                      status: "error",
                      message:
                        "موجودی کیف پول کافی نیست. موجودی: 100,000 ریال — مبلغ سفارش: 800,000 ریال",
                      code: 400,
                    },
                  },
                  alreadyEnrolled: {
                    summary: "قبلاً خریداری شده",
                    value: {
                      status: "error",
                      message:
                        'شما قبلاً دوره "آموزش React پیشرفته" را خریداری کرده‌اید',
                      code: 400,
                    },
                  },
                  courseUnavailable: {
                    summary: "دوره غیرفعال",
                    value: {
                      status: "error",
                      message: 'دوره "آموزش React پیشرفته" دیگر در دسترس نیست',
                      code: 400,
                    },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized: Invalid or expired token." },
          404: {
            description: "Wallet not found. User must have a wallet to pay.",
            content: {
              "application/json": {
                example: {
                  status: "error",
                  message: "کیف پول یافت نشد. ابتدا کیف پول خود را شارژ کنید",
                  code: 404,
                },
              },
            },
          },
        },
      },
    },

    "/api/orders/checkout/zarinpal": {
      post: {
        tags: ["Order"],
        summary: "Checkout with ZarinPal",
        description: `Creates an order from the user's cart and initiates ZarinPal payment.`,
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        responses: {
          200: {
            description: "لینک پرداخت زرین‌پال.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    orderId: "order-uuid",
                    paymentUrl:
                      "https://sandbox.zarinpal.com/pg/StartPay/A00000000000000000000000000123456",
                  },
                },
              },
            },
          },
          400: {
            description: "سبد خالی، دوره نامعتبر، یا قبلاً خریداری شده.",
            content: {
              "application/json": {
                examples: {
                  emptyCart: {
                    summary: "سبد خالی",
                    value: {
                      status: "error",
                      message: "سبد خرید خالی است",
                      code: 400,
                    },
                  },
                  alreadyEnrolled: {
                    summary: "قبلاً خریداری شده",
                    value: {
                      status: "error",
                      message:
                        'شما قبلاً دوره "آموزش ری اکت پیشرفته" را خریداری کرده‌اید',
                      code: 400,
                    },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized: Invalid or expired token." },
          500: {
            description: "خطا در ارتباط با درگاه زرین‌پال.",
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

    "/api/orders/my-orders": {
      get: {
        tags: ["Order"],
        summary: "Get user's order history",
        description:
          "Returns list of all orders for the authenticated user with optional status filter and pagination.",
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
              enum: ["PENDING", "PAID", "CANCELLED"],
            },
            description: "Filter by Status",
          },
        ],
        responses: {
          200: {
            description: "List of Orders.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    items: [
                      {
                        id: "order-uuid",
                        totalAmount: 800000,
                        status: "PAID",
                        paymentMethod: "WALLET",
                        createdAt: "2026-01-15T14:00:00.000Z",
                        updatedAt: "2026-01-15T14:00:05.000Z",
                        items: [
                          {
                            id: "item-uuid",
                            courseTitle: "آموزش React پیشرفته",
                            price: 500000,
                          },
                        ],
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

    "/api/orders/admin": {
      get: {
        tags: ["Order"],
        summary: "Get all orders (Admin)",
        description:
          "Returns all orders with optional filters. Supports search by user name or email.",
        security: [{ CookieAuth: [] }, { BearerAuth: [] }],
        parameters: [
          {
            name: "page",
            in: "query",
            schema: { type: "string" },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "string" },
          },
          {
            name: "status",
            in: "query",
            schema: {
              type: "string",
              enum: ["PENDING", "PAID", "CANCELLED"],
            },
            description: "Filter by Status",
          },
          {
            name: "search",
            in: "query",
            schema: { type: "string", maxLength: 100 },
            description: "Search by user name or email",
          },
        ],
        responses: {
          200: {
            description: "List of Orders for admin.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    items: [
                      {
                        id: "order-uuid",
                        totalAmount: 800000,
                        status: "PAID",
                        paymentMethod: "WALLET",
                        createdAt: "2026-01-15T14:00:00.000Z",
                        user: {
                          id: "user-uuid",
                          email: "ali@example.com",
                          name: "Ali",
                        },
                        items: [
                          {
                            id: "item-uuid",
                            courseTitle: "آموزش React",
                            price: 500000,
                          },
                        ],
                      },
                    ],
                    pagination: { page: 1, limit: 10, total: 25 },
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

    "/api/orders/admin/{id}": {
      get: {
        tags: ["Order"],
        summary: "Get order details (Admin)",
        description:
          "Returns full details of any order. Admin access required.",
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
            description: "Details of Order.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    order: {
                      id: "order-uuid",
                      totalAmount: 800000,
                      status: "PAID",
                      paymentMethod: "WALLET",
                      createdAt: "2026-01-15T14:00:00.000Z",
                      updatedAt: "2026-01-15T14:00:05.000Z",
                      user: {
                        id: "user-uuid",
                        email: "ali@example.com",
                        name: "Ali",
                      },
                      items: [
                        {
                          id: "item-uuid",
                          courseId: "course-uuid",
                          courseTitle: "آموزش React پیشرفته",
                          courseSlug: "react-advanced",
                          courseImageUrl: "/uploads/courses/react.jpg",
                          price: 500000,
                          createdAt: "2026-01-15T14:00:00.000Z",
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized: Invalid or expired token." },
          403: { description: "Forbidden: Admin access required." },
          404: { description: "Order not found." },
        },
      },
    },

    "/api/orders/{id}": {
      get: {
        tags: ["Order"],
        summary: "Get order details",
        description:
          "Returns full details of a specific order. User can only view their own orders.",
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
            description: "Details of Order.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    order: {
                      id: "order-uuid",
                      totalAmount: 800000,
                      status: "PAID",
                      paymentMethod: "WALLET",
                      createdAt: "2026-01-15T14:00:00.000Z",
                      updatedAt: "2026-01-15T14:00:05.000Z",
                      items: [
                        {
                          id: "item-uuid",
                          courseId: "course-uuid",
                          courseTitle: "آموزش React پیشرفته",
                          courseSlug: "react-advanced",
                          courseImageUrl: "/uploads/courses/react.jpg",
                          price: 500000,
                          createdAt: "2026-01-15T14:00:00.000Z",
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized: Invalid or expired token." },
          403: { description: "Access denied: Not your order." },
          404: { description: "Order not found." },
        },
      },
    },

    "/api/orders/{id}/cancel": {
      patch: {
        tags: ["Order"],
        summary: "Cancel a pending order",
        description:
          "Cancels an order that is still in PENDING status. Cannot cancel PAID or already CANCELLED orders.",
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
            description: "Order cancelled successfully.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    message: "سفارش با موفقیت لغو شد",
                    order: {
                      id: "order-uuid",
                      totalAmount: 800000,
                      status: "CANCELLED",
                      paymentMethod: null,
                      createdAt: "2026-01-15T14:00:00.000Z",
                      updatedAt: "2026-01-15T14:10:00.000Z",
                      items: [
                        {
                          id: "item-uuid",
                          courseId: "course-uuid",
                          courseTitle: "آموزش React پیشرفته",
                          courseSlug: "react-advanced",
                          courseImageUrl: "/uploads/courses/react.jpg",
                          price: 500000,
                          createdAt: "2026-01-15T14:00:00.000Z",
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Order cannot be cancelled.",
            content: {
              "application/json": {
                example: {
                  status: "error",
                  message: "این سفارش قابل پرداخت/لغو نیست (وضعیت: PAID)",
                  code: 400,
                },
              },
            },
          },
          401: { description: "Unauthorized: Invalid or expired token." },
          403: { description: "Access denied: Not your order." },
          404: { description: "Order not found." },
        },
      },
    },

    "/api/orders/admin/{id}/cancel": {
      patch: {
        tags: ["Order"],
        summary: "Cancel a pending order (Admin)",
        description:
          "Admin can cancel any PENDING order. " +
          "Cannot cancel PAID orders (requires refund functionality). " +
          "Cannot cancel already CANCELLED orders.",
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
            description: "Order cancelled successfully by admin.",
            content: {
              "application/json": {
                example: {
                  status: "success",
                  data: {
                    message: "سفارش توسط ادمین لغو شد",
                    order: {
                      id: "order-uuid",
                      totalAmount: 800000,
                      status: "CANCELLED",
                      paymentMethod: null,
                      createdAt: "2026-01-15T14:00:00.000Z",
                      updatedAt: "2026-01-15T14:10:00.000Z",
                      user: {
                        id: "user-uuid",
                        email: "ali@example.com",
                        name: "Ali",
                      },
                      items: [
                        {
                          id: "item-uuid",
                          courseId: "course-uuid",
                          courseTitle: "آموزش React پیشرفته",
                          courseSlug: "react-advanced",
                          courseImageUrl: "/uploads/courses/react.jpg",
                          price: 500000,
                          createdAt: "2026-01-15T14:00:00.000Z",
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Order cannot be cancelled.",
            content: {
              "application/json": {
                examples: {
                  alreadyCancelled: {
                    summary: "قبلاً لغو شده",
                    value: {
                      status: "error",
                      message: "این سفارش قبلاً لغو شده است",
                      code: 400,
                    },
                  },
                  alreadyPaid: {
                    summary: "پرداخت شده",
                    value: {
                      status: "error",
                      message:
                        "امکان لغو سفارش پرداخت شده وجود ندارد. برای این کار نیاز به بازپرداخت (Refund) دارید",
                      code: 400,
                    },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized: Invalid or expired token." },
          403: { description: "Forbidden: Admin access required." },
          404: { description: "Order not found." },
        },
      },
    },
  },
};
