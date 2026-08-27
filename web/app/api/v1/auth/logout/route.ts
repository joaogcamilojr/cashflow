import { revokeCurrentSession } from "@/lib/auth/session";
import { jsonData } from "@/lib/http";

export async function POST() {
  await revokeCurrentSession();
  return jsonData({ loggedOut: true });
}
