import { ipKeyGenerator, rateLimit } from "express-rate-limit";

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  skipSuccessfulRequests: true,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: (req) => {
    const email = (req.body?.email as string)?.toLowerCase();
    const ip = ipKeyGenerator(req.ip ?? "unknown");
    return email ? `${ip}:${email}` : ip;
  },
  message: {
    status: "fail",
    data: {
      message: "تعداد تلاش‌ های ناموفق بیش از حد. ۱۵ دقیقه دیگر تلاش کنید.",
    },
  },
});

export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    status: "fail",
    data: {
      message: "محدودیت ثبت‌ نام. لطفاً بعداً تلاش کنید.",
    },
  },
});

export const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 3,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: (req) => {
    const email = (req.body?.email as string)?.toLowerCase();
    const ip = ipKeyGenerator(req.ip ?? "unknown");
    return email ? `forgot-pwd:${ip}:${email}` : `forgot-pwd:${ip}`;
  },
  message: {
    status: "fail",
    data: {
      message: "تعداد درخواست‌ها بیش از حد. لطفاً ۱ ساعت دیگر تلاش کنید.",
    },
  },
});

export const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: (req) => {
    const email = (req.body?.email as string)?.toLowerCase();
    const ip = ipKeyGenerator(req.ip ?? "unknown");
    return email ? `reset-pwd:${ip}:${email}` : `reset-pwd:${ip}`;
  },
  message: {
    status: "fail",
    data: {
      message: "تعداد تلاش‌های ناموفق بیش از حد.",
    },
  },
});

export const resendVerificationLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 3,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: (req) => {
    const email = (req.body?.email as string)?.toLowerCase();
    const ip = ipKeyGenerator(req.ip ?? "unknown");
    return email ? `resend-verify:${ip}:${email}` : `resend-verify:${ip}`;
  },
  message: {
    status: "fail",
    data: {
      message: "تعداد درخواست‌ها بیش از حد. لطفاً ۵ دقیقه دیگر تلاش کنید.",
    },
  },
});

export const resendResetCodeLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 3,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: (req) => {
    const email = (req.body?.email as string)?.toLowerCase();
    const ip = ipKeyGenerator(req.ip ?? "unknown");
    return email ? `resend-reset:${ip}:${email}` : `resend-reset:${ip}`;
  },
  message: {
    status: "fail",
    data: {
      message: "تعداد درخواست‌ها بیش از حد. لطفاً ۵ دقیقه دیگر تلاش کنید.",
    },
  },
});

export const changeEmailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 3,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: (req) => {
    const ip = ipKeyGenerator(req.ip ?? "unknown");
    return `change-email:${ip}`;
  },
  message: {
    status: "fail",
    data: {
      message:
        "تعداد درخواست‌های تغییر ایمیل بیش از حد. ۱ ساعت دیگر تلاش کنید.",
    },
  },
});
