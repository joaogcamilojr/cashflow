import { AccountStatus } from "@prisma/client";
import { NextRequest } from "next/server";

import { getSession } from "@/lib/auth/session";
import { jsonData, jsonError } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session)
    return jsonError(401, "UNAUTHORIZED", "Authentication required.");
  const { id } = await params;
  const account = await prisma.account.findFirst({
    where: { id, ownerId: session.userId, status: AccountStatus.ACTIVE },
  });
  if (!account)
    return jsonError(
      403,
      "FORBIDDEN",
      "Only the active owner can archive the account.",
    );
  return jsonData(
    await prisma.account.update({
      where: { id },
      data: { status: AccountStatus.ARCHIVED, archivedAt: new Date() },
    }),
  );
}
