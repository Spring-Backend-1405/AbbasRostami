import type { Request } from "express";
import { ipKeyGenerator, rateLimit } from "express-rate-limit";

const getIp = (req: Request) => ipKeyGenerator(req.ip ?? "unknown");

const getEmail = (req: Request) => {
  const email = req.body?.email;
  return typeof email === "string" ? email.trim().toLowerCase() : undefined;
};

const jsonMessage = (message: string) => ({
  status: "fail",
  data: { message },
});

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  skipSuccessfulRequests: true,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: (req) => {
    const email = getEmail(req);
    const ip = getIp(req);
    return email ? `login:${ip}:${email}` : `login:${ip}`;
  },
  message: jsonMessage(
    "تعداد تلاش‌ های ناموفق بیش از حد. ۱۵ دقیقه دیگر تلاش کنید.",
  ),
});

export const registerIpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: (req) => `register-ip:${getIp(req)}`,
  message: jsonMessage("تعداد درخواست ثبت‌نام از این IP بیش از حد مجاز است."),
});

export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: (req) => {
    const email = getEmail(req);
    const ip = getIp(req);
    return email ? `register:${ip}:${email}` : `register:${ip}`;
  },
  message: jsonMessage("محدودیت ثبت‌ نام. لطفاً بعداً تلاش کنید."),
});

export const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 3,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: (req) => {
    const email = getEmail(req);
    const ip = getIp(req);
    return email ? `forgot-pwd:${ip}:${email}` : `forgot-pwd:${ip}`;
  },
  message: jsonMessage(
    "تعداد درخواست‌ها بیش از حد. لطفاً ۱ ساعت دیگر تلاش کنید.",
  ),
});

export const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: (req) => {
    const email = getEmail(req);
    const ip = getIp(req);
    return email ? `reset-pwd:${ip}:${email}` : `reset-pwd:${ip}`;
  },
  message: jsonMessage("تعداد تلاش‌های ناموفق بیش از حد."),
});

export const resendVerificationLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 3,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: (req) => {
    const email = getEmail(req);
    const ip = getIp(req);
    return email ? `resend-verify:${ip}:${email}` : `resend-verify:${ip}`;
  },
  message: jsonMessage(
    "تعداد درخواست‌ها بیش از حد. لطفاً ۵ دقیقه دیگر تلاش کنید.",
  ),
});

export const resendResetCodeLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 3,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: (req) => {
    const email = getEmail(req);
    const ip = getIp(req);
    return email ? `resend-reset:${ip}:${email}` : `resend-reset:${ip}`;
  },
  message: jsonMessage(
    "تعداد درخواست‌ها بیش از حد. لطفاً ۵ دقیقه دیگر تلاش کنید.",
  ),
});

export const changeEmailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 3,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: (req) => {
    const ip = getIp(req);
    const newEmail =
      typeof req.body?.newEmail === "string"
        ? req.body.newEmail.trim().toLowerCase()
        : undefined;

    return newEmail ? `change-email:${ip}:${newEmail}` : `change-email:${ip}`;
  },
  message: jsonMessage(
    "تعداد درخواست‌های تغییر ایمیل بیش از حد. ۱ ساعت دیگر تلاش کنید.",
  ),
});

export const resendChangeEmailCodeLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 3,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: (req) => {
    const ip = getIp(req);
    return `resend-change-email:${ip}`;
  },
  message: jsonMessage(
    "تعداد درخواست‌ها بیش از حد. لطفاً ۵ دقیقه دیگر تلاش کنید.",
  ),
});
