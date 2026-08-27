import { NextRequest } from "next/server";

import { accountDetailsForForm } from "@/lib/account-service";
import { getAccountTypeConfiguration } from "@/lib/accounts/account-types";
import { getSession } from "@/lib/auth/session";
import { jsonData, jsonError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import {
  cardInput,
  parseUpdateAccountInput,
  publicAccount,
  ValidationError,
} from "@/lib/validation";
import { AccountMemberRole } from "@prisma/client";

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: Context) {
  const session = await getSession();
  if (!session)
    return jsonError(401, "UNAUTHORIZED", "Authentication required.");
  const { id } = await context.params;
  const access = await accountDetailsForForm(session.userId, id);
  return access
    ? jsonData({
        ...publicAccount(access.account),
        permissions: {
          canEdit: access.role === AccountMemberRole.OWNER,
          canAddBalance:
            access.role === AccountMemberRole.OWNER &&
            access.account.status === "ACTIVE",
        },
      })
    : jsonError(404, "RESOURCE_NOT_FOUND", "Account not found.");
}

export async function PATCH(request: NextRequest, context: Context) {
  const session = await getSession();
  if (!session)
    return jsonError(401, "UNAUTHORIZED", "Authentication required.");
  const { id } = await context.params;
  const access = await accountDetailsForForm(session.userId, id);
  if (!access || access.role !== AccountMemberRole.OWNER)
    return jsonError(403, "FORBIDDEN", "Only the owner can edit the account.");
  try {
    if (access.account.status !== "ACTIVE")
      return jsonError(
        409,
        "ACCOUNT_ARCHIVED",
        "Conta arquivada não pode ser editada.",
      );
    const body = (await request.json()) as Record<string, unknown>;
    const input = parseUpdateAccountInput(body, access.account.type);
    const assets = await prisma.asset.findMany({
      where: { active: true },
      select: { id: true, type: true },
    });
    const card = cardInput(
      body,
      getAccountTypeConfiguration(access.account.type),
      assets,
      false,
    );
    const account = await prisma.account.update({
      where: { id },
      data: {
        ...input,
        cardProfile:
          card === undefined
            ? undefined
            : card
              ? { upsert: { create: card, update: card } }
              : { delete: true },
      },
      include: { balances: { include: { asset: true } }, cardProfile: true },
    });
    return jsonData(publicAccount(account));
  } catch (error) {
    const code =
      error instanceof ValidationError ? error.code : "VALIDATION_ERROR";
    return jsonError(
      code === "CONFLICT" ? 409 : 400,
      code,
      error instanceof Error ? error.message : "Invalid account",
    );
  }
}

export async function DELETE(_request: NextRequest, context: Context) {
  const session = await getSession();
  if (!session)
    return jsonError(401, "UNAUTHORIZED", "Authentication required.");
  const { id } = await context.params;
  try {
    const { deleteEmptyAccount } = await import("@/lib/account-service");
    await deleteEmptyAccount(session.userId, id);
    return jsonData({ deleted: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Delete failed";
    return jsonError(
      message === "ACCOUNT_NOT_EMPTY"
        ? 409
        : message === "FORBIDDEN"
          ? 403
          : 400,
      message,
      message === "ACCOUNT_NOT_EMPTY"
        ? "Archive the account instead; financial history is retained."
        : message,
    );
  }
}
