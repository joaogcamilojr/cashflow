import { cookies, headers } from "next/headers";
import { createHash, randomBytes } from "node:crypto";

import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from "@/lib/auth/constants";
import { prisma } from "@/lib/prisma";

export const ACCESS_TOKEN_MINUTES = 15;
export const REFRESH_TOKEN_DAYS = 30;
export const PROTOTYPE_EMAIL_VERIFICATION_BYPASS =
  process.env.NODE_ENV !== "production" &&
  process.env.PROTOTYPE_EMAIL_VERIFICATION_BYPASS === "true";

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function cookieOptions(expires: Date) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires,
  };
}

export async function createAuthTokens(userId: string) {
  const now = new Date();
  const accessToken = randomBytes(32).toString("base64url");
  const refreshToken = randomBytes(48).toString("base64url");
  const accessExpiresAt = new Date(
    now.getTime() + ACCESS_TOKEN_MINUTES * 60000,
  );
  const refreshExpiresAt = new Date(
    now.getTime() + REFRESH_TOKEN_DAYS * 86400000,
  );
  const userAgent = (await headers()).get("user-agent")?.slice(0, 240) || null;
  await prisma.authSession.create({
    data: {
      userId,
      tokenHash: hashToken(accessToken),
      expiresAt: accessExpiresAt,
      userAgent,
    },
  });
  await prisma.authRefreshToken.create({
    data: {
      userId,
      tokenHash: hashToken(refreshToken),
      expiresAt: refreshExpiresAt,
      userAgent,
    },
  });
  return { accessToken, refreshToken, accessExpiresAt, refreshExpiresAt };
}

export async function setAuthCookies(
  tokens: Awaited<ReturnType<typeof createAuthTokens>>,
) {
  const store = await cookies();
  store.set(
    ACCESS_TOKEN_COOKIE,
    tokens.accessToken,
    cookieOptions(tokens.accessExpiresAt),
  );
  store.set(
    REFRESH_TOKEN_COOKIE,
    tokens.refreshToken,
    cookieOptions(tokens.refreshExpiresAt),
  );
}

export async function rotateRefreshToken(token: string) {
  const current = await prisma.authRefreshToken.findUnique({
    where: { tokenHash: hashToken(token) },
  });
  if (!current || current.revokedAt || current.expiresAt <= new Date())
    return null;
  const tokens = await createAuthTokens(current.userId);
  await prisma.authRefreshToken.update({
    where: { id: current.id },
    data: { revokedAt: new Date(), replacedBy: hashToken(tokens.refreshToken) },
  });
  return tokens;
}

export async function revokeCurrentSession() {
  const store = await cookies();
  const accessToken = store.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = store.get(REFRESH_TOKEN_COOKIE)?.value;
  if (accessToken)
    await prisma.authSession.updateMany({
      where: { tokenHash: hashToken(accessToken), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  if (refreshToken)
    await prisma.authRefreshToken.updateMany({
      where: { tokenHash: hashToken(refreshToken), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  store.delete(ACCESS_TOKEN_COOKIE);
  store.delete(REFRESH_TOKEN_COOKIE);
}

export async function getSession() {
  const token = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
  if (!token) return null;
  const session = await prisma.authSession.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  });
  if (
    !session ||
    session.revokedAt ||
    session.expiresAt <= new Date() ||
    session.user.archivedAt ||
    !session.user.emailVerifiedAt
  )
    return null;
  if (session.lastSeenAt.getTime() < Date.now() - 300000)
    await prisma.authSession.update({
      where: { id: session.id },
      data: { lastSeenAt: new Date() },
    });
  return session;
}

export async function requireSession() {
  const session = await getSession();
  if (!session) throw new Error("UNAUTHORIZED");
  return session;
}
