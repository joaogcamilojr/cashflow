/* eslint-disable @typescript-eslint/no-explicit-any */
import { AccountMemberRole, AccountStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export type AccountAccess = { account: any; role: AccountMemberRole };

export async function getAccountAccess(
  userId: string,
  accountId: string,
): Promise<AccountAccess | null> {
  const account = await prisma.account.findFirst({
    where: {
      id: accountId,
      status: AccountStatus.ACTIVE,
      OR: [{ ownerId: userId }, { members: { some: { userId } } }],
    },
    include: { balances: { include: { asset: true } }, cardProfile: true },
  });
  if (!account) return null;
  const role =
    account.ownerId === userId
      ? AccountMemberRole.OWNER
      : (
          await prisma.accountMember.findUnique({
            where: { accountId_userId: { accountId, userId } },
          })
        )?.role;
  return role ? { account, role } : null;
}

export function can(
  role: AccountMemberRole,
  action: "read" | "create_entry" | "manage",
) {
  if (action === "read") return true;
  if (action === "create_entry")
    return (
      role === AccountMemberRole.OWNER ||
      role === AccountMemberRole.TRANSACTION_MANAGER
    );
  return role === AccountMemberRole.OWNER;
}

export function forbidden(
  role: AccountMemberRole,
  action: "read" | "create_entry" | "manage",
) {
  return !can(role, action);
}
