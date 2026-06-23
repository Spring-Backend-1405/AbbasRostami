import { Prisma } from "../../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import {
  buildPaginationMeta,
  parsePagination,
} from "../../utils/pagination.js";
import {
  requestPayment,
  verifyPayment as zarinpalVerify,
} from "../../utils/zarinpal.util.js";
import {
  ChargeWalletInput,
  ListAdminTransactionsQuery,
  ListUserTransactionsQuery,
  ListWalletsAdminQuery,
} from "./wallet.validator.js";

const walletWithUser = {
  user: {
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
    },
  },
};

const transactionWithUser = {
  user: {
    select: {
      id: true,
      email: true,
      name: true,
    },
  },
  course: {
    select: {
      id: true,
      title: true,
      slug: true,
    },
  },
};

export const walletService = {
  async getOrCreateWallet(userId: string) {
    let wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: { userId, balance: 0 },
      });
    }

    return wallet;
  },

  async getWalletBalance(userId: string) {
    const wallet = await this.getOrCreateWallet(userId);
    return wallet;
  },

  async chargeWallet(userId: string, data: ChargeWalletInput) {
    await this.getOrCreateWallet(userId);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, phone: true },
    });

    if (!user) {
      throw new AppError("کاربر یافت نشد", 404);
    }

    const zarinpalResult = await requestPayment({
      amount: data.amount,
      description: `شارژ کیف پول به مبلغ ${data.amount} ریال`,
      email: user.email,
      mobile: user.phone || undefined,
    });

    if (!zarinpalResult.success || !zarinpalResult.authority) {
      throw new AppError(
        zarinpalResult.error || "خطا در ارتباط با درگاه پرداخت",
        500,
      );
    }

    const transaction = await prisma.transaction.create({
      data: {
        amount: data.amount,
        type: "CHARGE",
        status: "PENDING",
        authority: zarinpalResult.authority,
        description: `شارژ کیف پول`,
        userId,
      },
    });

    return {
      transaction,
      paymentUrl: zarinpalResult.paymentUrl,
      authority: zarinpalResult.authority,
    };
  },

  async verifyPayment(authority: string, status: string) {
    const transaction = await prisma.transaction.findUnique({
      where: { authority },
    });

    if (!transaction) {
      throw new AppError("تراکنش یافت نشد", 404);
    }

    if (transaction.status !== "PENDING") {
      throw new AppError(
        `این تراکنش قبلاً پردازش شده است (وضعیت: ${transaction.status})`,
        400,
      );
    }

    if (status === "NOK") {
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: "CANCELLED" },
      });

      throw new AppError("پرداخت توسط کاربر لغو شد", 400);
    }

    const verifyResult = await zarinpalVerify({
      authority,
      amount: transaction.amount,
    });

    if (!verifyResult.success) {
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: "FAILED" },
      });

      throw new AppError(verifyResult.error || "پرداخت ناموفق بود", 400);
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedTransaction = await tx.transaction.update({
        where: { id: transaction.id },
        data: {
          status: "SUCCESS",
          refId: verifyResult.refId,
        },
      });

      const updatedWallet = await tx.wallet.update({
        where: { userId: transaction.userId },
        data: { balance: { increment: transaction.amount } },
      });

      return { transaction: updatedTransaction, wallet: updatedWallet };
    });

    return {
      transaction: result.transaction,
      newBalance: result.wallet.balance,
      refId: verifyResult.refId,
    };
  },

  async getUserTransactions(userId: string, query: ListUserTransactionsQuery) {
    const { skip, take, page, limit } = parsePagination(query);

    const where: Prisma.TransactionWhereInput = { userId };

    if (query.status) where.status = query.status;
    if (query.type) where.type = query.type;

    const [items, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
          course: {
            select: { id: true, title: true, slug: true },
          },
        },
      }),
      prisma.transaction.count({ where }),
    ]);

    return {
      items,
      pagination: buildPaginationMeta(total, page, limit),
    };
  },

  async getAllWallets(query: ListWalletsAdminQuery) {
    const { skip, take, page, limit } = parsePagination(query);

    const where: Prisma.WalletWhereInput = {};

    if (query.minBalance || query.maxBalance) {
      where.balance = {};
      if (query.minBalance) where.balance.gte = Number(query.minBalance);
      if (query.maxBalance) where.balance.lte = Number(query.maxBalance);
    }

    if (query.search) {
      where.user = {
        OR: [
          { email: { contains: query.search, mode: "insensitive" } },
          { name: { contains: query.search, mode: "insensitive" } },
        ],
      };
    }

    const [items, total] = await Promise.all([
      prisma.wallet.findMany({
        where,
        skip,
        take,
        orderBy: { balance: "desc" },
        include: walletWithUser,
      }),
      prisma.wallet.count({ where }),
    ]);

    return {
      items,
      pagination: buildPaginationMeta(total, page, limit),
    };
  },

  async getAllTransactions(query: ListAdminTransactionsQuery) {
    const { skip, take, page, limit } = parsePagination(query);

    const where: Prisma.TransactionWhereInput = {};

    if (query.status) where.status = query.status;
    if (query.type) where.type = query.type;
    if (query.userId) where.userId = query.userId;

    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) where.createdAt.gte = new Date(query.startDate);
      if (query.endDate) where.createdAt.lte = new Date(query.endDate);
    }

    const [items, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: transactionWithUser,
      }),
      prisma.transaction.count({ where }),
    ]);

    return {
      items,
      pagination: buildPaginationMeta(total, page, limit),
    };
  },

  async deductBalance(
    userId: string,
    amount: number,
    description: string,
    courseId: string,
    tx: Prisma.TransactionClient,
  ) {
    const wallet = await tx.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new AppError("کیف پول یافت نشد", 404);
    }

    if (wallet.balance < amount) {
      throw new AppError(
        `موجودی کیف پول کافی نیست. موجودی فعلی: ${wallet.balance} ریال`,
        400,
        {
          balance: `موجودی فعلی: ${wallet.balance} ریال`,
        },
      );
    }

    const updatedWallet = await tx.wallet.update({
      where: { userId },
      data: {
        balance: { decrement: amount },
      },
    });

    const transaction = await tx.transaction.create({
      data: {
        amount,
        type: "PURCHASE",
        status: "SUCCESS",
        description,
        userId,
        courseId,
      },
    });

    return {
      wallet: updatedWallet,
      transaction,
    };
  },
};
