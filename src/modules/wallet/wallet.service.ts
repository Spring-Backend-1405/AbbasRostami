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
} from "../../utils/zarinpal.js";
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
    return prisma.wallet.upsert({
      where: { userId },
      create: { userId, balance: 0 },
      update: {},
    });
  },

  async getWalletBalance(userId: string) {
    const wallet = await this.getOrCreateWallet(userId);
    return wallet;
  },

  async chargeWallet(userId: string, data: ChargeWalletInput) {
    const backendUrl = process.env.BACKEND_URL;
    if (!backendUrl) {
      throw new AppError("BACKEND_URL در محیط تعریف نشده است", 500);
    }

    const [_, user] = await Promise.all([
      this.getOrCreateWallet(userId),
      prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, phone: true },
      }),
    ]);

    if (!user) {
      throw new AppError("کاربر یافت نشد", 404);
    }

    const zarinpalResult = await requestPayment({
      amount: data.amount,
      description: `شارژ کیف پول به مبلغ ${data.amount} ریال`,
      callbackUrl: `${backendUrl}/api/wallet/verify`,
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
      return {
        success: false,
        reason: "تراکنش یافت نشد",
        transaction: null,
        newBalance: null,
        refId: null,
      };
    }

    if (transaction.status !== "PENDING") {
      return {
        success: transaction.status === "SUCCESS",
        reason:
          transaction.status !== "SUCCESS"
            ? "تراکنش قبلاً پردازش شده است"
            : undefined,
        transaction,
        newBalance: null,
        refId: null,
      };
    }

    if (status === "NOK") {
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: "CANCELLED" },
      });

      return {
        success: false,
        reason: "پرداخت توسط کاربر لغو شد",
        transaction,
        newBalance: null,
        refId: null,
      };
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

      return {
        success: false,
        reason: verifyResult.error || "پرداخت ناموفق بود",
        transaction,
        newBalance: null,
        refId: null,
      };
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
      success: true,
      transaction: result.transaction,
      newBalance: result.wallet.balance,
      refId: verifyResult.refId,
      reason: undefined,
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
};
