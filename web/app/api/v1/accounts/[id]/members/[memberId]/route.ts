import { AccountMemberRole } from "@prisma/client";
import { NextRequest } from "next/server";

import { getSession } from "@/lib/auth/session";
import { jsonData, jsonError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { enumValue } from "@/lib/validation";

type Context = { params: Promise<{ id: string; memberId: string }> };
async function owner(userId: string, accountId: string) {
  return prisma.account.findFirst({
    where: { id: accountId, ownerId: userId, status: "ACTIVE" },
  });
}

export async function PATCH(request: NextRequest, { params }: Context) {
  const session = await getSession();
  if (!session)
    return jsonError(401, "UNAUTHORIZED", "Authentication required.");
  const { id, memberId } = await params;
  if (!(await owner(session.userId, id)))
    return jsonError(403, "FORBIDDEN", "Only the owner can change members.");
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const role = enumValue(
      body.role,
      [AccountMemberRole.VIEWER, AccountMemberRole.TRANSACTION_MANAGER],
      "role",
    );
    const member = await prisma.accountMember.findFirst({
      where: { id: memberId, accountId: id },
    });
    if (!member || member.role === AccountMemberRole.OWNER)
      return jsonError(404, "RESOURCE_NOT_FOUND", "Member not found.");
    return jsonData(
      await prisma.accountMember.update({
        where: { id: member.id },
        data: { role },
      }),
    );
  } catch {
    return jsonError(404, "RESOURCE_NOT_FOUND", "Member not found.");
  }
}

export async function DELETE(_request: NextRequest, { params }: Context) {
  const session = await getSession();
  if (!session)
    return jsonError(401, "UNAUTHORIZED", "Authentication required.");
  const { id, memberId } = await params;
  if (!(await owner(session.userId, id)))
    return jsonError(403, "FORBIDDEN", "Only the owner can revoke members.");
  try {
    const member = await prisma.accountMember.findFirst({
      where: { id: memberId, accountId: id },
    });
    if (!member)
      return jsonError(404, "RESOURCE_NOT_FOUND", "Member not found.");
    if (member.role === AccountMemberRole.OWNER)
      return jsonError(409, "OWNER_REQUIRED", "Owner cannot be removed.");
    await prisma.accountMember.delete({ where: { id: member.id } });
    return jsonData({ revoked: true });
  } catch {
    return jsonError(404, "RESOURCE_NOT_FOUND", "Member not found.");
  }
}
