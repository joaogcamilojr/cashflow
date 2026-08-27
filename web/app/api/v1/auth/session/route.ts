import { getSession } from "@/lib/auth/session";
import { jsonData, jsonError } from "@/lib/http";

export async function GET() {
  const session = await getSession();
  if (!session)
    return jsonError(
      401,
      "UNAUTHORIZED",
      "Session is missing, expired or revoked.",
    );
  return jsonData({
    user: {
      id: session.user.id,
      email: session.user.email,
      displayName: session.user.displayName,
      baseAssetId: session.user.baseAssetId,
    },
  });
}
