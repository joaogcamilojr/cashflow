import { NextRequest } from "next/server";

import {
  createAuthTokens,
  hashToken,
  setAuthCookies,
} from "@/lib/auth/session";
import { jsonData, jsonError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { emailValue, stringValue } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const email = emailValue(body.email);
    const code = stringValue(body.code, "code", 6);
    if (!/^\d{6}$/.test(code)) throw new Error("code is invalid");
    const user = await prisma.user.findUnique({ where: { email } });
    const loginCode = user
      ? await prisma.loginCode.findFirst({
          where: { userId: user.id, usedAt: null },
          orderBy: { createdAt: "desc" },
        })
      : null;
    if (
      !user ||
      !user.emailVerifiedAt ||
      !loginCode ||
      loginCode.expiresAt <= new Date() ||
      loginCode.codeHash !== hashToken(code)
    )
      return jsonError(401, "INVALID_CODE", "Código inválido ou expirado.");
    await prisma.loginCode.update({
      where: { id: loginCode.id },
      data: { usedAt: new Date() },
    });
    const tokens = await createAuthTokens(user.id);
    await setAuthCookies(tokens);
    return jsonData(
      {
        user: { id: user.id, email: user.email, displayName: user.displayName },
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: tokens.accessExpiresAt,
      },
      200,
    );
  } catch (error) {
    return jsonError(
      400,
      "LOGIN_ERROR",
      error instanceof Error ? error.message : "Invalid request",
    );
  }
}
