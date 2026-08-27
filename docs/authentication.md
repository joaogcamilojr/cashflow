# Autenticação experimental

## Cadastro e confirmação

Fluxo: nome + e-mail normalizado → `User` upsert → `EmailVerificationToken` aleatório → SHA-256 no banco → template `emailConfirmation` → link `WEB_URL/api/v1/auth/verify` → `emailVerifiedAt` → access/refresh tokens → `/dashboard`.

Expiração da confirmação: 30 minutos. Token é de uso único.

## Login

Fluxo: e-mail confirmado → `LoginCode` de seis dígitos → SHA-256 no banco → template `secureAccess` → validação do OTP → access token + refresh token.

OTP expira em 10 minutos. Novo OTP invalida o anterior.

Access token expira em 15 minutos. Refresh token expira em 30 dias e é rotacionado a cada uso.

Não existe senha. O envio usa exclusivamente templates publicados no Resend. `PROTOTYPE_EMAIL_VERIFICATION_BYPASS` permanece disponível apenas para compatibilidade local, mas está desligado.

`proxy.ts` protege `/dashboard` e `/accounts` pela presença otimista do cookie e envia usuário sem cookie a `/login`. A autorização real sempre ocorre em `getSession()` no banco dentro de handlers/layout server-side.

Rollout futuro: provider de e-mail com token de uso único, TTL curto, rate limit e auditoria; alternativa OIDC/OAuth2. Remover bypass antes de produção.

Variáveis: `DATABASE_URL`, `WEB_URL`, `RESEND_API_KEY`, `RESEND_FROM` e `PROTOTYPE_EMAIL_VERIFICATION_BYPASS`. Nenhum secret deve ser versionado.
