# API v1

Base: `/api/v1`. JSON. Datas ISO 8601. Valores financeiros sempre strings decimais. Não aceitar objetos Prisma como DTO.

## Autenticação

`POST /auth/early-access` recebe `{ "name": "João", "email": "user@example.com" }`, cria a conta e envia confirmação. `GET /auth/verify?token=...` confirma o e-mail e autentica. `POST /auth/login` envia OTP para usuário confirmado. `POST /auth/login/verify` valida OTP e cria tokens. `POST /auth/refresh` rotaciona o refresh token. `POST /auth/logout` revoga tokens. `GET /auth/session` retorna usuário atual.

Cookies: `cash_flow_access_token` e `cash_flow_refresh_token`, `httpOnly`, `sameSite=lax`, `secure` em produção, `path=/`. Access token expira em 15 minutos; refresh token em 30 dias. Tokens puros nunca são persistidos; apenas SHA-256.

Templates Resend: `emailConfirmation` (`2db22596-8ad9-43bf-9c92-3ca9cf98a872`) e `secureAccess` (`382b4ca4-be47-4b42-8670-2e8f5015fc08`).

## Recursos

| Método | Rota                              | Regra                               |
| ------ | --------------------------------- | ----------------------------------- |
| GET    | `/assets`                         | catálogo ativo; pode retornar vazio |
| GET    | `/accounts`                       | contas do owner ou membro           |
| POST   | `/accounts`                       | owner e saldos iniciais atômicos    |
| GET    | `/accounts/:id`                   | qualquer membro ativo               |
| PATCH  | `/accounts/:id`                   | owner                               |
| DELETE | `/accounts/:id`                   | somente conta vazia                 |
| POST   | `/accounts/:id/archive`           | owner                               |
| POST   | `/accounts/:id/restore`           | owner                               |
| GET    | `/accounts/:id/members`           | membro                              |
| POST   | `/accounts/:id/shares`            | owner; convite ou aceite controlado |
| PATCH  | `/accounts/:id/members/:memberId` | owner                               |
| DELETE | `/accounts/:id/members/:memberId` | owner, nunca owner                  |

## Criação de conta

Campos: `name`, `type`, `institutionName`, `countryCode`, `includeInNetWorth`, `includeInAvailableBalance`, `card` opcional e `openingBalances`.

```json
{
  "name": "Prex pessoal",
  "type": "MULTI_CURRENCY_ACCOUNT",
  "countryCode": "UY",
  "openingBalances": [
    {
      "assetId": "cuid",
      "amount": "120.50",
      "occurredAt": "2026-08-27T12:00:00Z"
    }
  ]
}
```

Saldo zero cria `AccountBalance` sem lançamento artificial. Saldo positivo cria `OPENING_BALANCE` e `LedgerEntry` CREDIT. Ativo, escala e decimal são validados no backend.

## Erros

Formato: `{ "error": { "code": "FORBIDDEN", "message": "..." } }`.

Principais códigos: `VALIDATION_ERROR`, `UNAUTHORIZED`, `FORBIDDEN`, `RESOURCE_NOT_FOUND`, `ACCOUNT_NOT_EMPTY`, `ACCOUNT_ARCHIVED`, `OWNER_REQUIRED`, `AUTH_NOT_CONFIGURED`.

## Fora desta etapa

Não há endpoint de lançamento geral, transferência, câmbio real ou provider. A camada `account-service` já mantém o caminho para `postLedgerTransaction`/`postExchangeTransaction` futuros; não inventa cotação atual.
