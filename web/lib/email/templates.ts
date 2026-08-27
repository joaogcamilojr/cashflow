export const EMAIL_TEMPLATES = {
  emailConfirmation: {
    id: "2db22596-8ad9-43bf-9c92-3ca9cf98a872",
    variables: [
      "ACTIVATION_URL",
      "EXPIRATION_MINUTES",
      "SUPPORT_URL",
      "USER_NAME",
    ],
  },
  secureAccess: {
    id: "382b4ca4-be47-4b42-8670-2e8f5015fc08",
    variables: [
      "EXPIRATION_MINUTES",
      "LOGIN_URL",
      "OTP_CODE",
      "SUPPORT_URL",
      "USER_NAME",
    ],
  },
} as const;

export type EmailTemplateName = keyof typeof EMAIL_TEMPLATES;

export const emailTemplate = (name: EmailTemplateName) => {
  const template = EMAIL_TEMPLATES[name];

  if (!template.id) {
    throw new Error(`Resend template ID não configurado: ${name}`);
  }

  return { id: template.id };
};
