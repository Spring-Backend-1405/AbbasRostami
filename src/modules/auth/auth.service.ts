import dns from "dns"; // 👈 ۱. حتماً این ماژول پیش‌فرض نود را بالا ایمپورت کن
import nodemailer from "nodemailer";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt.js";
import { comparePassword, hashPassword } from "../../utils/password.js";
import {
  getChangeEmailTemplate,
  getResetPasswordEmailTemplate,
  getVerificationEmailTemplate,
} from "./auth.templates.js";
import { AuthResponse } from "./auth.types.js";
import {
  ChangePasswordInput,
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  RequestChangeEmailInput,
  ResendResetCodeInput,
  ResendVerificationInput,
  ResetPasswordInput,
  VerifyChangeEmailInput,
  VerifyEmailInput,
} from "./auth.validator.js";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
  dnsLookup: (hostname, options, callback) => {
    dns.lookup(hostname, { family: 4 }, callback);
  },
} as nodemailer.TransportOptions);

const generateCode = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const sendVerificationEmail = async (
  email: string,
  name: string | null,
  code: string,
) => {
  const emailHtml = getVerificationEmailTemplate(name || "کاربر گرامی", code);

  await transporter.sendMail({
    from: `"پشتیبانی پروژه" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "🔑 کد تایید حساب کاربری",
    text: `سلام ${name || "کاربر گرامی"}\nکد تایید شما: ${code}\nاین کد تا ۱۵ دقیقه معتبر است.`,
    html: emailHtml,
  });
};

const sendResetPasswordEmail = async (
  email: string,
  name: string | null,
  code: string,
) => {
  const emailHtml = getResetPasswordEmailTemplate(name || "کاربر گرامی", code);

  await transporter.sendMail({
    from: `"پشتیبانی پروژه" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "🔐 بازیابی رمز عبور",
    text: `سلام ${name || "کاربر گرامی"}\nکد بازیابی رمز عبور شما: ${code}\nاین کد تا ۱۵ دقیقه معتبر است.`,
    html: emailHtml,
  });
};

export const authService = {
  async register(data: RegisterInput) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new AppError("خطا در ثبت نام", 400, {
        email: "کاربری با این ایمیل قبلاً ثبت‌ نام کرده است",
      });
    }

    const hashedPassword = await hashPassword(data.password);
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();
    const verificationExpires = new Date(Date.now() + 15 * 60 * 1000);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        verificationCode,
        verificationExpires,
        wallet: {
          create: {
            balance: 0,
          },
        },
      },
    });

    sendVerificationEmail(user.email, user.name, verificationCode)
      .then(() => console.log(`✉️ Email sent to ${user.email}`))
      .catch((err) => console.error("❌ Error sending email:", err));

    return { email: user.email, message: "کد تایید به ایمیل شما ارسال شد" };
  },

  async verifyEmail(data: VerifyEmailInput): Promise<AuthResponse> {
    const user = await prisma.user.findUnique({ where: { email: data.email } });

    if (!user || !user.verificationCode || !user.verificationExpires) {
      throw new AppError("خطا در تایید ایمیل", 400, {
        code: "کد تایید اشتباه است",
      });
    }

    if (user.verificationExpires < new Date()) {
      throw new AppError("خطا در تایید ایمیل", 400, {
        code: "کد تایید منقضی شده است، لطفاً مجدداً ثبت‌نام کنید",
      });
    }

    if (user.verificationCode !== data.code) {
      throw new AppError("کد تایید اشتباه است", 400);
    }

    const accessToken = generateAccessToken({ id: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ id: user.id });

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationCode: null,
        verificationExpires: null,
        refreshToken,
      },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
      },
    };
  },

  async login(data: LoginInput): Promise<AuthResponse> {
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
      throw new AppError("ایمیل یا رمز عبور اشتباه است", 401);
    }

    if (!user.isVerified) {
      throw new AppError(
        "حساب کاربری شما هنوز تایید نشده است. ابتدا ایمیل خود را تایید کنید",
        403,
      );
    }

    const isMatch = await comparePassword(data.password, user.password);
    if (!isMatch) {
      throw new AppError("ایمیل یا رمز عبور اشتباه است", 401);
    }

    const accessToken = generateAccessToken({ id: user.id, email: user.email });
    const refreshToken = generateRefreshToken({ id: user.id });

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, name: user.name },
    };
  },

  async refresh(token: string) {
    try {
      const decoded = verifyRefreshToken(token) as { id: string };
      const user = await prisma.user.findUnique({ where: { id: decoded.id } });

      if (!user || user.refreshToken !== token) {
        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: { refreshToken: null },
          });
        }
        throw new AppError("توکن نوسازی نامعتبر یا منقضی شده است", 401);
      }

      const newAccessToken = generateAccessToken({
        id: user.id,
        email: user.email,
      });
      const newRefreshToken = generateRefreshToken({ id: user.id });

      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: newRefreshToken },
      });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError("نشست شما منقضی شده است، لطفا دوباره وارد شوید", 401);
    }
  },

  async logout(token: string) {
    try {
      const decoded = verifyRefreshToken(token) as { id: string };
      await prisma.user.update({
        where: { id: decoded.id },
        data: { refreshToken: null },
      });
    } catch {}
  },

  async forgotPassword(data: ForgotPasswordInput) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    const genericMessage = {
      message: "اگر این ایمیل در سیستم وجود داشته باشد، کد بازیابی ارسال شد",
    };

    if (!user) {
      return genericMessage;
    }

    if (!user.isVerified) {
      return genericMessage;
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetExpires = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordCode: resetCode,
        resetPasswordExpires: resetExpires,
      },
    });

    sendResetPasswordEmail(user.email, user.name, resetCode)
      .then(() => console.log(`📧 Reset email sent to ${user.email}`))
      .catch((err) => console.error("❌ Error sending reset email:", err));

    return genericMessage;
  },

  async resetPassword(data: ResetPasswordInput) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user || !user.resetPasswordCode || !user.resetPasswordExpires) {
      throw new AppError("درخواست بازیابی معتبر نیست", 400, {
        code: "ابتدا درخواست بازیابی رمز عبور دهید",
      });
    }

    if (user.resetPasswordExpires < new Date()) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetPasswordCode: null,
          resetPasswordExpires: null,
        },
      });

      throw new AppError("کد بازیابی منقضی شده است", 400, {
        code: "کد منقضی شده است، دوباره درخواست دهید",
      });
    }

    if (user.resetPasswordCode !== data.code) {
      throw new AppError("کد بازیابی اشتباه است", 400, {
        code: "کد وارد شده صحیح نیست",
      });
    }

    const hashedPassword = await hashPassword(data.newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordCode: null,
        resetPasswordExpires: null,
        refreshToken: null,
      },
    });

    return {
      message: "رمز عبور شما با موفقیت تغییر یافت. لطفاً مجدداً وارد شوید",
    };
  },

  async resendVerification(data: ResendVerificationInput) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    const genericMessage = {
      message: "اگر این ایمیل در سیستم وجود داشته باشد، کد ارسال شد",
    };

    if (!user) {
      return genericMessage;
    }

    if (user.isVerified) {
      return genericMessage;
    }

    const verificationCode = generateCode();
    const verificationExpires = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationCode,
        verificationExpires,
      },
    });

    sendVerificationEmail(user.email, user.name, verificationCode)
      .then(() => console.log(`📧 Verification resent to ${user.email}`))
      .catch((err) =>
        console.error("❌ Error sending verification email:", err),
      );

    return genericMessage;
  },

  async resendResetCode(data: ResendResetCodeInput) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    const genericMessage = {
      message: "اگر این ایمیل در سیستم وجود داشته باشد، کد ارسال شد",
    };

    if (!user) {
      return genericMessage;
    }

    if (!user.isVerified) {
      return genericMessage;
    }

    if (!user.resetPasswordCode) {
      throw new AppError("ابتدا درخواست بازیابی رمز عبور دهید", 400);
    }

    const resetCode = generateCode();
    const resetExpires = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordCode: resetCode,
        resetPasswordExpires: resetExpires,
      },
    });

    sendResetPasswordEmail(user.email, user.name, resetCode)
      .then(() => console.log(`📧 Reset code resent to ${user.email}`))
      .catch((err) => console.error("❌ Error sending reset email:", err));

    return genericMessage;
  },

  async changePassword(userId: string, data: ChangePasswordInput) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError("کاربر یافت نشد", 404);
    }

    const isMatch = await comparePassword(data.currentPassword, user.password);

    if (!isMatch) {
      throw new AppError("رمز عبور فعلی اشتباه است", 400, {
        currentPassword: "رمز عبور فعلی صحیح نیست",
      });
    }

    const hashedPassword = await hashPassword(data.newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        refreshToken: null,
      },
    });

    return {
      message: "رمز عبور با موفقیت تغییر یافت. لطفاً مجدداً وارد شوید",
    };
  },

  async requestChangeEmail(userId: string, data: RequestChangeEmailInput) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError("کاربر یافت نشد", 404);
    }

    if (user.email === data.newEmail.toLowerCase()) {
      throw new AppError("ایمیل جدید نمی‌تواند با ایمیل فعلی یکسان باشد", 400, {
        newEmail: "ایمیل جدید همان ایمیل فعلی است",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: data.newEmail.toLowerCase() },
    });

    if (existingUser) {
      throw new AppError("این ایمیل قبلاً استفاده شده است", 400, {
        newEmail: "کاربر دیگری با این ایمیل ثبت‌نام کرده است",
      });
    }

    const isMatch = await comparePassword(data.password, user.password);
    if (!isMatch) {
      throw new AppError("رمز عبور اشتباه است", 400, {
        password: "رمز عبور صحیح نیست",
      });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.user.update({
      where: { id: userId },
      data: {
        pendingNewEmail: data.newEmail.toLowerCase(),
        changeEmailCode: code,
        changeEmailExpires: expires,
      },
    });

    const emailHtml = getChangeEmailTemplate(
      user.name || "کاربر گرامی",
      data.newEmail,
      code,
    );

    transporter
      .sendMail({
        from: `"پشتیبانی پروژه" <${process.env.EMAIL_USER}>`,
        to: data.newEmail,
        subject: "📧 تایید تغییر ایمیل",
        text: `سلام\nکد تایید تغییر ایمیل: ${code}\nاین کد تا ۱۵ دقیقه معتبر است.`,
        html: emailHtml,
      })
      .then((info) =>
        console.log(
          `📧 Change email sent to ${data.newEmail}. ID: ${info.messageId}`,
        ),
      )
      .catch((err) => console.error("❌ Error sending change email:", err));

    return {
      message: "کد تایید به ایمیل جدید شما ارسال شد",
      newEmail: data.newEmail,
    };
  },

  async verifyChangeEmail(userId: string, data: VerifyChangeEmailInput) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError("کاربر یافت نشد", 404);
    }

    if (
      !user.pendingNewEmail ||
      !user.changeEmailCode ||
      !user.changeEmailExpires
    ) {
      throw new AppError("درخواست تغییر ایمیل معتبر نیست", 400, {
        code: "ابتدا درخواست تغییر ایمیل دهید",
      });
    }

    if (user.changeEmailExpires < new Date()) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          pendingNewEmail: null,
          changeEmailCode: null,
          changeEmailExpires: null,
        },
      });

      throw new AppError("کد منقضی شده است", 400, {
        code: "کد منقضی شده است، دوباره درخواست دهید",
      });
    }

    if (user.changeEmailCode !== data.code) {
      throw new AppError("کد اشتباه است", 400, {
        code: "کد وارد شده صحیح نیست",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: user.pendingNewEmail },
    });

    if (existingUser) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          pendingNewEmail: null,
          changeEmailCode: null,
          changeEmailExpires: null,
        },
      });

      throw new AppError(
        "این ایمیل در فاصله درخواست تا تایید توسط شخص دیگری ثبت شده است",
        400,
      );
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        email: user.pendingNewEmail,
        pendingNewEmail: null,
        changeEmailCode: null,
        changeEmailExpires: null,
        refreshToken: null,
      },
    });

    return {
      message: "ایمیل شما با موفقیت تغییر یافت. لطفاً مجدداً وارد شوید",
      newEmail: user.pendingNewEmail,
    };
  },
};
