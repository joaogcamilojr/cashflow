import { NextRequest } from "next/server";

import { requestLoginCode } from "@/lib/auth/email-auth";
import { jsonData, jsonError } from "@/lib/http";

export async function POST(request: NextRequest) {
  try {
    return jsonData(
      await requestLoginCode(
        ((await request.json()) as Record<string, unknown>).email,
      ),
    );
  } catch (error) {
    return jsonError(
      400,
      "LOGIN_ERROR",
      error instanceof Error ? error.message : "Invalid request",
    );
  }
}
