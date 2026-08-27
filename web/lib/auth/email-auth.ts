import { randomBytes, randomInt } from "node:crypto";

import { sendTemplateEmail } from "@/lib/email/resend";
import { prisma } from "@/lib/prisma";
import { emailValue, stringValue } from "@/lib/validation";
import { hashToken } from "./session";

const APP_URL = process.env.WEB_URL || "http://localhost:3000";
const SUPPORT_URL = APP_URL;
const VERIFICATION_MINUTES = 30;
const LOGIN_CODE_MINUTES = 10;

function userName(displayName: string | null, email: string) {
  return displayName || email.split("@")[0];
}

export async function requestEarlyAccess(body: Record<string, unknown>) {
  const email = emailValue(body.email);
  const displayName = stringValue(body.name, "name", 120);
  const user = await prisma.user.upsert({
    where: { email },
    update: { displayName },
    create: { email, displayName },
  });
  if (user.emailVerifiedAt) return { alreadyVerified: true, email };

  const rawToken = randomBytes(32).toString("base64url");
  await prisma.emailVerificationToken.deleteMany({
    where: { userId: user.id, usedAt: null },
  });
  await prisma.emailVerificationToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(rawToken),
      expiresAt: new Date(Date.now() + VERIFICATION_MINUTES * 60000),
    },
  });
  const result = await sendTemplateEmail({
    template: "emailConfirmation",
    to: email,
    subject: "Confirme seu e-mail",
    variables: {
      ACTIVATION_URL: `${APP_URL}/api/v1/auth/verify?token=${rawToken}`,
      EXPIRATION_MINUTES: String(VERIFICATION_MINUTES),
      SUPPORT_URL,
      USER_NAME: userName(displayName, email),
    },
    idempotencyKey: `email-confirmation/${user.id}`,
  });
  if (result.error)
    throw new Error("Não foi possível enviar o e-mail de confirmação");
  return { alreadyVerified: false, email };
}

export async function requestLoginCode(emailInput: unknown) {
  const email = emailValue(emailInput);
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.emailVerifiedAt) throw new Error("E-mail não confirmado");
  const code = String(randomInt(100000, 1000000));
  await prisma.loginCode.deleteMany({
    where: { userId: user.id, usedAt: null },
  });
  await prisma.loginCode.create({
    data: {
      userId: user.id,
      codeHash: hashToken(code),
      expiresAt: new Date(Date.now() + LOGIN_CODE_MINUTES * 60000),
    },
  });
  const result = await sendTemplateEmail({
    template: "secureAccess",
    to: email,
    subject: "Seu código de acesso",
    variables: {
      EXPIRATION_MINUTES: String(LOGIN_CODE_MINUTES),
      LOGIN_URL: `${APP_URL}/login`,
      OTP_CODE: code,
      SUPPORT_URL,
      USER_NAME: userName(user.displayName, email),
    },
    idempotencyKey: `secure-access/${user.id}/${code}`,
  });
  if (result.error)
    throw new Error("Não foi possível enviar o código de acesso");
  return { email };
}

export { APP_URL, VERIFICATION_MINUTES };
