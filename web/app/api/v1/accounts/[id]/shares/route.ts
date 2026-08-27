import { AccountMemberRole } from "@prisma/client";
import { NextRequest } from "next/server";

import { getSession } from "@/lib/auth/session";
import { jsonData, jsonError } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { emailValue, enumValue } from "@/lib/validation";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session)
    return jsonError(401, "UNAUTHORIZED", "Authentication required.");
  const { id } = await params;
  const account = await prisma.account.findFirst({
    where: { id, ownerId: session.userId, status: "ACTIVE" },
  });
  if (!account)
    return jsonError(403, "FORBIDDEN", "Only the owner can share the account.");
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const email = emailValue(body.email);
    const role = enumValue(
      body.role,
      [AccountMemberRole.VIEWER, AccountMemberRole.TRANSACTION_MANAGER],
      "role",
    );
    const invitedUser = await prisma.user.findUnique({ where: { email } });
    if (invitedUser) {
      await prisma.accountMember.upsert({
        where: { accountId_userId: { accountId: id, userId: invitedUser.id } },
        create: { accountId: id, userId: invitedUser.id, role },
        update: { role },
      });
      return jsonData({ accepted: true, email, role }, 201);
    }
    const invitation = await prisma.accountShareInvitation.create({
      data: {
        accountId: id,
        invitedByUserId: session.userId,
        email,
        role,
        expiresAt: new Date(Date.now() + 7 * 86400000),
      },
    });
    return jsonData(
      {
        ...invitation,
        createdAt: invitation.createdAt.toISOString(),
        expiresAt: invitation.expiresAt.toISOString(),
        updatedAt: invitation.updatedAt.toISOString(),
      },
      201,
    );
  } catch (error) {
    return jsonError(
      400,
      "VALIDATION_ERROR",
      error instanceof Error ? error.message : "Invalid invitation",
    );
  }
}
