import { cookies } from "next/headers";
import { NextRequest } from "next/server";

import { REFRESH_TOKEN_COOKIE } from "@/lib/auth/constants";
import { rotateRefreshToken, setAuthCookies } from "@/lib/auth/session";
import { jsonData, jsonError } from "@/lib/http";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as Record<
    string,
    unknown
  >;
  const token =
    typeof body.refreshToken === "string"
      ? body.refreshToken
      : (await cookies()).get(REFRESH_TOKEN_COOKIE)?.value;
  if (!token)
    return jsonError(401, "REFRESH_TOKEN_REQUIRED", "Refresh token ausente.");
  const tokens = await rotateRefreshToken(token);
  if (!tokens)
    return jsonError(
      401,
      "INVALID_REFRESH_TOKEN",
      "Refresh token inválido ou expirado.",
    );
  await setAuthCookies(tokens);
  return jsonData({
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    expiresAt: tokens.accessExpiresAt,
  });
}
