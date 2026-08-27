# Cash Flow | Global

Primeira versão autenticada experimental do produto B2C multimoeda da Apgees.

## Estado

- Next.js 16 App Router com Route Handlers em `web/app/api/v1`;
- Prisma 6.19.0 e PostgreSQL;
- autenticação por e-mail com confirmação e código OTP;
- access token curto e refresh token rotativo;
- dashboard e CRUD de contas, carteiras e cartões;
- templates de e-mail publicados no Resend;
- migration de autenticação ainda pendente;
- sem seed, câmbio real ou integração bancária.

## Documentos

- [Arquitetura](./architecture.md)
- [Modelo de dados](./data-model.md)
- [Autenticação](./authentication.md)
- [Permissões](./permissions.md)
- [API](./api.md)
- [Produto](./product.md)

## Executar

```bash
pnpm --dir web install
cp web/.env.example web/.env
pnpm --dir web db:generate
pnpm --dir web dev
```

`DATABASE_URL` deve apontar para PostgreSQL. `WEB_URL` define o domínio usado nos links de e-mail. O catálogo de ativos precisa ser provisionado antes de criar saldos em moeda.

Env de desenvolvimento:

```env
WEB_URL=http://localhost:3000
RESEND_API_KEY=re_xxxxxxxxx
RESEND_FROM=Cash Flow <noreply@dominio-verificado.com>
```

Migration futura, não executada:

```bash
pnpm prisma migrate dev --name auth_tokens_email_verification
```
