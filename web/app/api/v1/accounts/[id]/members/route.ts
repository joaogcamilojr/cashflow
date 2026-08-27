import { NextRequest } from "next/server";

import { getSession } from "@/lib/auth/session";
import { jsonData, jsonError } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session)
    return jsonError(401, "UNAUTHORIZED", "Authentication required.");
  const { id } = await params;
  const member = await prisma.accountMember.findFirst({
    where: { accountId: id, userId: session.userId },
  });
  const owner = await prisma.account.findFirst({
    where: { id, ownerId: session.userId },
  });
  if (!member && !owner)
    return jsonError(
      403,
      "FORBIDDEN",
      "You do not have access to this account.",
    );
  return jsonData(
    await prisma.accountMember.findMany({
      where: { accountId: id },
      include: {
        user: { select: { id: true, email: true, displayName: true } },
      },
    }),
  );
}
