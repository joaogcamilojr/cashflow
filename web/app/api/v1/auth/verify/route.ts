import { NextRequest, NextResponse } from "next/server";

import { APP_URL } from "@/lib/auth/email-auth";
import {
  createAuthTokens,
  hashToken,
  setAuthCookies,
} from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token)
    return NextResponse.redirect(`${APP_URL}/login?error=invalid_verification`);
  const verification = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash: hashToken(token) },
  });
  if (
    !verification ||
    verification.usedAt ||
    verification.expiresAt <= new Date()
  )
    return NextResponse.redirect(`${APP_URL}/login?error=expired_verification`);
  const user = await prisma.user.update({
    where: { id: verification.userId },
    data: { emailVerifiedAt: new Date() },
  });
  await prisma.emailVerificationToken.update({
    where: { id: verification.id },
    data: { usedAt: new Date() },
  });
  const tokens = await createAuthTokens(user.id);
  await setAuthCookies(tokens);
  return NextResponse.redirect(`${APP_URL}/dashboard`);
}
