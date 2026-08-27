import { NextRequest } from "next/server";

import { createAccount } from "@/lib/account-service";
import { getAccountTypeConfiguration } from "@/lib/accounts/account-types";
import { getSession } from "@/lib/auth/session";
import { jsonData, jsonError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import {
  cardInput,
  parseCreateAccountInput,
  parseOpeningBalances,
  publicAccount,
  ValidationError,
} from "@/lib/validation";

export async function GET() {
  const session = await getSession();
  if (!session)
    return jsonError(401, "UNAUTHORIZED", "Authentication required.");
  const accounts = await prisma.account.findMany({
    where: {
      OR: [
        { ownerId: session.userId },
        { members: { some: { userId: session.userId } } },
      ],
    },
    orderBy: { updatedAt: "desc" },
    include: { balances: { include: { asset: true } }, cardProfile: true },
  });
  return jsonData(accounts.map(publicAccount));
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session)
    return jsonError(401, "UNAUTHORIZED", "Authentication required.");
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const input = parseCreateAccountInput(body);
    if (!input.type)
      throw new ValidationError("VALIDATION_ERROR", "type is required");
    const assets = await prisma.asset.findMany({
      where: { active: true },
      select: { id: true, code: true, decimals: true, type: true },
    });
    const openings = parseOpeningBalances(
      body.openingBalances,
      assets,
      input.type,
    );
    const card = cardInput(
      body,
      getAccountTypeConfiguration(input.type),
      assets,
    );
    const account = await createAccount(session.userId, input, card, openings);
    return jsonData(publicAccount(account), 201);
  } catch (error) {
    const code =
      error instanceof ValidationError ? error.code : "VALIDATION_ERROR";
    return jsonError(
      code === "DUPLICATE_ASSET" ? 409 : 400,
      code,
      error instanceof Error ? error.message : "Invalid account",
    );
  }
}
