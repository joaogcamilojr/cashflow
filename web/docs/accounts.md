# Contas, carteiras e cartões

## Matriz de tipos

| Tipo                 | Ativos            | Seleção | País        | Instituição | Cartão             | Patrimônio   | Disponível   |
| -------------------- | ----------------- | ------- | ----------- | ----------- | ------------------ | ------------ | ------------ |
| Carteira de dinheiro | FIAT              | 1       | opcional    | não         | não                | sim          | sim          |
| Conta bancária       | FIAT              | 1       | obrigatório | obrigatório | não                | sim          | sim          |
| Conta internacional  | FIAT              | 1+      | obrigatório | obrigatório | não                | sim          | sim          |
| Conta multimoeda     | FIAT              | 1+      | obrigatório | obrigatório | não                | sim          | sim          |
| Benefício            | FIAT/POINTS       | 1       | obrigatório | obrigatório | opcional           | não          | sim          |
| Gift card            | FIAT/POINTS       | 1       | obrigatório | obrigatório | opcional           | não          | sim          |
| Saldo digital        | FIAT/POINTS/OTHER | 1       | obrigatório | obrigatório | não                | não          | sim          |
| Carteira cripto      | CRYPTO            | 1+      | opcional    | opcional    | não                | sim          | não          |
| Cartão de crédito    | FIAT              | 1       | obrigatório | obrigatório | obrigatório CREDIT | não          | não          |
| Cartão pré-pago      | FIAT              | 1+      | obrigatório | obrigatório | obrigatório        | sim          | sim          |
| Outro                | qualquer          | 1+      | opcional    | opcional    | opcional           | configurável | configurável |

Labels, descrições, ativos e defaults estão em `lib/accounts/account-types.ts`.

## País e data

`lib/countries` usa allowlist local de códigos alpha-2. Labels usam `Intl.DisplayNames` em `pt-BR`, com o código na opção. Backend recusa códigos inexistentes, mesmo com duas letras.

`openingDate` aceita somente `YYYY-MM-DD`, valida data real e ano entre 1900 e 2200. A conversão canônica para `LedgerTransaction.occurredAt` é `YYYY-MM-DDT12:00:00.000Z`. A interface não mostra horário.

## Payloads

```json
{
  "name": "Prex pessoal",
  "type": "MULTI_CURRENCY_ACCOUNT",
  "institutionName": "Prex",
  "countryCode": "UY",
  "openingBalances": [
    { "assetId": "asset_usd", "amount": "120.50", "openingDate": "2026-08-27" },
    { "assetId": "asset_uyu", "amount": "4500.00", "openingDate": "2026-08-26" }
  ]
}
```

`PATCH /api/v1/accounts/:id` aceita somente metadados, indicadores e `card`. Não aceita `type`, `balances`, membros, status, ledger ou campos de outra conta. PATCH parcial é válido.

Para adicionar moeda existente em conta compatível:

```json
{ "assetId": "asset_eur", "amount": "0", "openingDate": "2026-08-27" }
```

Endpoint: `POST /api/v1/accounts/:id/balances`. Duplicidade retorna `409 CONFLICT`. Contas arquivadas recusam adição.

## Ledger e edição

Criação é transação atômica. Cada saldo cria `AccountBalance`; apenas saldo maior que zero cria `OPENING_BALANCE`. Edição não reescreve `LedgerEntry` nem remove `AccountBalance`. Saldos existentes são somente leitura; remoção fica para etapa futura.

## CardProfile

Crédito exige tipo `CREDIT`, bandeira, últimos quatro dígitos, fechamento, vencimento e limite compatível quando informado. Pré-pago aceita `PREPAID`/`VIRTUAL`. Benefício aceita `BENEFIT`/`VIRTUAL`; gift card aceita `GIFT`/`VIRTUAL`. Nunca enviar PAN ou CVV.

## Permissões e erros

Owner edita e adiciona saldo. Viewer consulta. Transaction manager cria transações, mas não altera conta. Erros estáveis: `VALIDATION_ERROR`, `COUNTRY_REQUIRED`, `INVALID_COUNTRY_CODE`, `INSTITUTION_REQUIRED`, `ASSET_REQUIRED`, `ASSET_NOT_ALLOWED`, `DUPLICATE_ASSET`, `MULTIPLE_ASSETS_NOT_ALLOWED`, `CARD_PROFILE_REQUIRED`, `INVALID_CARD_PROFILE`, `ACCOUNT_ARCHIVED`, `FORBIDDEN`, `CONFLICT`.

## Limitações

Não há ajuste posterior de saldo, remoção de moeda histórica, faturas, câmbio ou integração bancária. Catálogo de ativos depende de provisionamento existente.
