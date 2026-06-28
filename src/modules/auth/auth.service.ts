import nodemailer from "nodemailer";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt.js";
import { comparePassword, hashPassword } from "../../utils/password.js";
import { getVerificationEmailTemplate } from "./auth.templates.js";
import { AuthResponse } from "./auth.types.js";
import {
  LoginInput,
  RegisterInput,
  VerifyEmailInput,
} from "./auth.validator.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

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

    const emailHtml = getVerificationEmailTemplate(
      user.name || "کاربر گرامی",
      verificationCode,
    );

    transporter
      .sendMail({
        from: `"پشتیبانی پروژه" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: "🔑 کد تایید حساب کاربری",
        text: `سلام ${user.name || "کاربر گرامی"}\nکد تایید شما: ${verificationCode}\nاین کد تا ۱۵ دقیقه معتبر است.`,
        html: emailHtml,
      })
      .then((info) =>
        console.log(`✉️ Email sent to ${user.email}. ID: ${info.messageId}`),
      )
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
};
