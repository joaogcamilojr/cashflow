/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  AccountMemberRole,
  AccountStatus,
  AssetType,
  Prisma,
} from "@prisma/client";

import { getAccountTypeConfiguration } from "@/lib/accounts/account-types";
import { getAccountAccess } from "@/lib/auth/authorization";
import { positive, validateScale } from "@/lib/money";
import { prisma } from "@/lib/prisma";

type Opening = {
  asset: { id: string; code: string; decimals: number };
  amount: Prisma.Decimal;
  occurredAt: Date;
};

export async function createAccount(
  userId: string,
  input: Record<string, unknown>,
  card: any,
  openings: Opening[],
) {
  return prisma.$transaction(
    async (tx) => {
      const account = await tx.account.create({
        data: {
          ...(input as any),
          ownerId: userId,
          members: { create: { userId, role: AccountMemberRole.OWNER } },
          cardProfile: card ? { create: card } : undefined,
        },
      });
      for (const opening of openings) {
        const balance = await tx.accountBalance.create({
          data: {
            accountId: account.id,
            assetId: opening.asset.id,
            currentBalance: opening.amount,
            availableBalance: opening.amount,
          },
        });
        if (opening.amount.gt(0)) {
          positive(opening.amount, "opening balance");
          await tx.ledgerTransaction.create({
            data: {
              createdByUserId: userId,
              accountId: account.id,
              type: "OPENING_BALANCE",
              description: "Saldo inicial",
              occurredAt: opening.occurredAt,
              entries: {
                create: {
                  accountId: account.id,
                  accountBalanceId: balance.id,
                  assetId: opening.asset.id,
                  direction: "CREDIT",
                  amount: opening.amount,
                  balanceAfter: opening.amount,
                },
              },
            },
          });
        }
      }
      return tx.account.findUniqueOrThrow({
        where: { id: account.id },
        include: {
          balances: {
            include: {
              asset: true,
              entries: {
                include: { transaction: true },
                where: { transaction: { type: "OPENING_BALANCE" } },
                orderBy: { createdAt: "asc" },
                take: 1,
              },
            },
          },
          cardProfile: true,
          members: true,
        },
      });
    },
    { timeout: 15000 },
  );
}

export async function accountDetails(userId: string, accountId: string) {
  return getAccountAccess(userId, accountId);
}

export async function accountDetailsForForm(userId: string, accountId: string) {
  const account = await prisma.account.findFirst({
    where: {
      id: accountId,
      OR: [{ ownerId: userId }, { members: { some: { userId } } }],
    },
    include: {
      balances: {
        include: {
          asset: true,
          entries: {
            where: { transaction: { type: "OPENING_BALANCE" } },
            include: { transaction: true },
            orderBy: { createdAt: "asc" },
            take: 1,
          },
        },
      },
      cardProfile: true,
      members: true,
    },
  });
  if (!account) return null;
  const role =
    account.ownerId === userId
      ? AccountMemberRole.OWNER
      : account.members.find((member) => member.userId === userId)?.role;
  return role ? { account, role } : null;
}

export async function deleteEmptyAccount(userId: string, accountId: string) {
  const access = await getAccountAccess(userId, accountId);
  if (!access || access.role !== AccountMemberRole.OWNER)
    throw new Error("FORBIDDEN");
  const history = await prisma.ledgerEntry.count({ where: { accountId } });
  const invitations = await prisma.accountShareInvitation.count({
    where: { accountId, status: { not: "REVOKED" } },
  });
  const members = await prisma.accountMember.count({ where: { accountId } });
  if (history || invitations || members > 1)
    throw new Error("ACCOUNT_NOT_EMPTY");
  await prisma.account.delete({ where: { id: accountId } });
}

export async function postOpeningBalance(
  userId: string,
  accountId: string,
  balanceId: string,
  amount: Prisma.Decimal,
  asset: { id: string; decimals: number; code: string },
  occurredAt: Date,
) {
  validateScale(amount, asset, "amount");
  positive(amount);
  const access = await getAccountAccess(userId, accountId);
  if (!access || access.role === AccountMemberRole.VIEWER)
    throw new Error("FORBIDDEN");
  if (access.account.status !== AccountStatus.ACTIVE)
    throw new Error("ACCOUNT_ARCHIVED");
  return prisma.$transaction(
    async (tx) => {
      const current = await tx.accountBalance.findUniqueOrThrow({
        where: { id: balanceId },
      });
      const next = current.currentBalance.add(amount);
      await tx.accountBalance.update({
        where: { id: balanceId },
        data: {
          currentBalance: next,
          availableBalance: next,
          lastCalculatedAt: new Date(),
        },
      });
      return tx.ledgerTransaction.create({
        data: {
          createdByUserId: userId,
          accountId,
          type: "ADJUSTMENT",
          description: "Ajuste de saldo",
          occurredAt,
          entries: {
            create: {
              accountId,
              accountBalanceId: balanceId,
              assetId: asset.id,
              direction: "CREDIT",
              amount,
              balanceAfter: next,
            },
          },
        },
      });
    },
    { timeout: 15000 },
  );
}

export async function addAccountBalance(
  userId: string,
  accountId: string,
  assetId: string,
  amount: Prisma.Decimal,
  occurredAt: Date,
) {
  const access = await getAccountAccess(userId, accountId);
  if (!access || access.role !== AccountMemberRole.OWNER)
    throw new Error("FORBIDDEN");
  if (access.account.status !== AccountStatus.ACTIVE)
    throw new Error("ACCOUNT_ARCHIVED");
  const config = getAccountTypeConfiguration(access.account.type);
  if (config.assetSelection !== "multiple")
    throw new Error("MULTIPLE_ASSETS_NOT_ALLOWED");
  const asset = await prisma.asset.findFirst({
    where: { id: assetId, active: true },
  });
  if (!asset || !config.allowedAssetTypes.includes(asset.type as AssetType))
    throw new Error("ASSET_NOT_ALLOWED");
  validateScale(amount, asset, "amount");
  if (amount.lt(0)) throw new Error("VALIDATION_ERROR");
  return prisma.$transaction(
    async (tx) => {
      const existing = await tx.accountBalance.findUnique({
        where: { accountId_assetId: { accountId, assetId } },
      });
      if (existing) throw new Error("CONFLICT");
      const balance = await tx.accountBalance.create({
        data: {
          accountId,
          assetId,
          currentBalance: amount,
          availableBalance: amount,
        },
      });
      if (amount.gt(0))
        await tx.ledgerTransaction.create({
          data: {
            createdByUserId: userId,
            accountId,
            type: "OPENING_BALANCE",
            description: "Saldo inicial",
            occurredAt,
            entries: {
              create: {
                accountId,
                accountBalanceId: balance.id,
                assetId,
                direction: "CREDIT",
                amount,
                balanceAfter: amount,
              },
            },
          },
        });
      return tx.account.findUniqueOrThrow({
        where: { id: accountId },
        include: {
          balances: {
            include: {
              asset: true,
              entries: {
                include: { transaction: true },
                where: { transaction: { type: "OPENING_BALANCE" } },
                orderBy: { createdAt: "asc" },
                take: 1,
              },
            },
          },
          cardProfile: true,
        },
      });
    },
    { timeout: 15000 },
  );
}
