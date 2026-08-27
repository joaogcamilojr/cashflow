import { NextRequest } from "next/server";

import { addAccountBalance } from "@/lib/account-service";
import { getSession } from "@/lib/auth/session";
import { jsonData, jsonError } from "@/lib/http";
import {
  parseAddAccountBalanceInput,
  publicAccount,
  ValidationError,
} from "@/lib/validation";

type Context = { params: Promise<{ id: string }> };
export async function POST(request: NextRequest, context: Context) {
  const session = await getSession();
  if (!session)
    return jsonError(401, "UNAUTHORIZED", "Authentication required.");
  const { id } = await context.params;
  try {
    const input = parseAddAccountBalanceInput(
      (await request.json()) as Record<string, unknown>,
    );
    const account = await addAccountBalance(
      session.userId,
      id,
      input.assetId,
      input.amount,
      input.occurredAt,
    );
    return jsonData(publicAccount(account), 201);
  } catch (error) {
    const code =
      error instanceof ValidationError
        ? error.code
        : error instanceof Error
          ? error.message
          : "VALIDATION_ERROR";
    const status =
      code === "FORBIDDEN"
        ? 403
        : ["CONFLICT", "ACCOUNT_ARCHIVED"].includes(code)
          ? 409
          : 400;
    return jsonError(
      status,
      code,
      error instanceof Error
        ? error.message
        : "Não foi possível adicionar o saldo.",
    );
  }
}
