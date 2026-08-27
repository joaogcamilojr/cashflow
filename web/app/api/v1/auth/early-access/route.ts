import { NextRequest } from "next/server";

import { requestEarlyAccess } from "@/lib/auth/email-auth";
import { jsonData, jsonError } from "@/lib/http";

export async function POST(request: NextRequest) {
  try {
    return jsonData(await requestEarlyAccess(await request.json()), 201);
  } catch (error) {
    return jsonError(
      400,
      "EARLY_ACCESS_ERROR",
      error instanceof Error ? error.message : "Invalid request",
    );
  }
}
