import { Resend } from "resend";

import { emailTemplate, type EmailTemplateName } from "./templates";

const resendApiKey = process.env.RESEND_API_KEY;
const resendFrom = process.env.RESEND_FROM;

if (!resendApiKey) {
  throw new Error("RESEND_API_KEY não configurada");
}

if (!resendFrom) {
  throw new Error("RESEND_FROM não configurada");
}

const resend = new Resend(resendApiKey);

type SendTemplateEmailInput = {
  template: EmailTemplateName;
  to: string | string[];
  subject: string;
  variables?: Record<string, string>;
  idempotencyKey?: string;
};

export async function sendTemplateEmail({
  template,
  to,
  subject,
  variables,
  idempotencyKey,
}: SendTemplateEmailInput) {
  const { data, error } = await resend.emails.send({
    from: resendFrom,
    to,
    subject,
    template: {
      ...emailTemplate(template),
      ...(variables ? { variables } : {}),
    },
    ...(idempotencyKey ? { idempotencyKey } : {}),
  });

  if (error) {
    console.error("Resend template error", error);
    return { data: null, error };
  }

  return { data, error: null };
}
