/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  AccountMemberRole,
  AccountStatus,
  AccountType,
  AssetType,
  CardType,
  YieldType,
} from "@prisma/client";

import { getAccountTypeConfiguration } from "@/lib/accounts/account-types";
import { isCountryCode } from "@/lib/countries";
import { parseDecimal, validateScale } from "@/lib/money";

export const accountTypes = Object.values(AccountType);
export const roles = Object.values(AccountMemberRole);
export const cardTypes = Object.values(CardType);
export const yieldTypes = Object.values(YieldType);

export class ValidationError extends Error {
  constructor(
    public code: string,
    message = code,
  ) {
    super(message);
  }
}

export function emailValue(value: unknown) {
  const email = stringValue(value, "email", 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw new ValidationError("VALIDATION_ERROR", "email is invalid");
  return email;
}

export function stringValue(
  value: unknown,
  field: string,
  max = 160,
  required = true,
) {
  if (
    typeof value !== "string" ||
    (required && !value.trim()) ||
    value.length > max
  )
    throw new ValidationError("VALIDATION_ERROR", `${field} is invalid`);
  return value.trim();
}

export function cuidValue(value: string, field = "id") {
  if (!/^[a-z0-9]{20,30}$/i.test(value))
    throw new ValidationError("VALIDATION_ERROR", `${field} is invalid`);
  return value;
}

export function enumValue<T extends string>(
  value: unknown,
  values: readonly T[],
  field: string,
): T {
  if (typeof value !== "string" || !values.includes(value as T))
    throw new ValidationError("VALIDATION_ERROR", `${field} is invalid`);
  return value as T;
}

export function parseCivilDate(value: unknown, field = "openingDate") {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    throw new ValidationError(
      "VALIDATION_ERROR",
      `${field} must be YYYY-MM-DD`,
    );
  const [year, month, day] = value.split("-").map(Number);
  const instant = new Date(Date.UTC(year, month - 1, day, 12));
  if (
    year < 1900 ||
    year > 2200 ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31 ||
    instant.getUTCFullYear() !== year ||
    instant.getUTCMonth() !== month - 1 ||
    instant.getUTCDate() !== day
  )
    throw new ValidationError("VALIDATION_ERROR", `${field} is invalid`);
  return instant;
}

export const parseCivilDateToCanonicalInstant = parseCivilDate;

export function formatCanonicalInstantAsCivilDate(value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value;
  return `${date.getUTCFullYear().toString().padStart(4, "0")}-${(date.getUTCMonth() + 1).toString().padStart(2, "0")}-${date.getUTCDate().toString().padStart(2, "0")}`;
}

function accountFields(body: Record<string, unknown>, includeType: boolean) {
  const type = includeType
    ? enumValue(body.type, accountTypes, "type")
    : undefined;
  const config = type ? getAccountTypeConfiguration(type) : undefined;
  const countryCode =
    body.countryCode == null || body.countryCode === ""
      ? null
      : stringValue(body.countryCode, "countryCode", 2).toUpperCase();

  if (countryCode && !isCountryCode(countryCode))
    throw new ValidationError(
      "INVALID_COUNTRY_CODE",
      "Código de país inválido",
    );

  if (config?.requiresCountry && !countryCode)
    throw new ValidationError(
      "COUNTRY_REQUIRED",
      "País é obrigatório para este tipo",
    );

  const institutionName =
    body.institutionName == null || body.institutionName === ""
      ? null
      : stringValue(body.institutionName, "institutionName", 120, false);

  if (config?.requiresInstitution && !institutionName)
    throw new ValidationError(
      "INSTITUTION_REQUIRED",
      "Instituição é obrigatória para este tipo",
    );

  if (config && !config.allowsCountry && countryCode)
    throw new ValidationError(
      "VALIDATION_ERROR",
      "País não permitido para este tipo",
    );

  if (config && !config.allowsInstitution && institutionName)
    throw new ValidationError(
      "VALIDATION_ERROR",
      "Instituição não permitida para este tipo",
    );

  return {
    ...(type ? { type } : {}),
    name: stringValue(body.name, "name", 100),
    description:
      body.description == null
        ? null
        : stringValue(body.description, "description", 500, false),
    institutionName,
    countryCode,
    externalReference:
      body.externalReference == null
        ? null
        : stringValue(body.externalReference, "externalReference", 120, false),
    color:
      body.color == null ? null : stringValue(body.color, "color", 20, false),
    icon: body.icon == null ? null : stringValue(body.icon, "icon", 40, false),
    includeInNetWorth:
      typeof body.includeInNetWorth === "boolean"
        ? body.includeInNetWorth
        : (config?.defaultIncludeInNetWorth ?? true),
    includeInAvailableBalance:
      typeof body.includeInAvailableBalance === "boolean"
        ? body.includeInAvailableBalance
        : (config?.defaultIncludeInAvailableBalance ?? true),
  };
}

export function parseCreateAccountInput(body: Record<string, unknown>) {
  return accountFields(body, true);
}

export function parseUpdateAccountInput(
  body: Record<string, unknown>,
  type: AccountType,
) {
  const allowed = [
    "name",
    "description",
    "institutionName",
    "countryCode",
    "externalReference",
    "color",
    "icon",
    "includeInNetWorth",
    "includeInAvailableBalance",
    "card",
  ];
  if (Object.keys(body).some((key) => !allowed.includes(key)))
    throw new ValidationError("VALIDATION_ERROR", "Campo não editável");
  const config = getAccountTypeConfiguration(type);
  const output: Record<string, unknown> = {};
  if ("name" in body) output.name = stringValue(body.name, "name", 100);
  for (const field of [
    "description",
    "externalReference",
    "color",
    "icon",
  ] as const)
    if (field in body)
      output[field] =
        body[field] == null
          ? null
          : stringValue(
              body[field],
              field,
              field === "description"
                ? 500
                : field === "icon"
                  ? 40
                  : field === "color"
                    ? 20
                    : 120,
              false,
            );
  if ("countryCode" in body) {
    const country =
      body.countryCode == null || body.countryCode === ""
        ? null
        : stringValue(body.countryCode, "countryCode", 2).toUpperCase();
    if (country && !isCountryCode(country))
      throw new ValidationError(
        "INVALID_COUNTRY_CODE",
        "Código de país inválido",
      );
    if (config.requiresCountry && !country)
      throw new ValidationError(
        "COUNTRY_REQUIRED",
        "País é obrigatório para este tipo",
      );
    output.countryCode = country;
  }
  if ("institutionName" in body) {
    const institution =
      body.institutionName == null || body.institutionName === ""
        ? null
        : stringValue(body.institutionName, "institutionName", 120, false);
    if (config.requiresInstitution && !institution)
      throw new ValidationError(
        "INSTITUTION_REQUIRED",
        "Instituição é obrigatória para este tipo",
      );
    output.institutionName = institution;
  }
  for (const field of [
    "includeInNetWorth",
    "includeInAvailableBalance",
  ] as const)
    if (field in body) {
      if (typeof body[field] !== "boolean")
        throw new ValidationError("VALIDATION_ERROR", `${field} is invalid`);
      output[field] = body[field];
    }
  return output;
}

export function parseOpeningBalances(
  input: unknown,
  assets: Array<{
    id: string;
    code: string;
    decimals: number;
    type: AssetType;
  }>,
  type: AccountType,
) {
  const config = getAccountTypeConfiguration(type);
  if (input == null) input = [];
  if (!Array.isArray(input) || input.length > 20)
    throw new ValidationError("VALIDATION_ERROR", "openingBalances inválido");
  if (config.assetSelection === "single" && input.length > 1)
    throw new ValidationError(
      "MULTIPLE_ASSETS_NOT_ALLOWED",
      "Este tipo aceita apenas um ativo",
    );
  const seen = new Set<string>();

  return input.map((raw) => {
    if (!raw || typeof raw !== "object")
      throw new ValidationError("VALIDATION_ERROR", "openingBalances inválido");
    const item = raw as Record<string, unknown>;
    const assetId = cuidValue(String(item.assetId), "assetId");
    if (seen.has(assetId))
      throw new ValidationError("DUPLICATE_ASSET", "Ativo repetido");
    seen.add(assetId);
    const asset = assets.find((candidate) => candidate.id === assetId);
    if (!asset)
      throw new ValidationError("ASSET_NOT_ALLOWED", "Ativo não encontrado");
    if (!config.allowedAssetTypes.includes(asset.type))
      throw new ValidationError(
        "ASSET_NOT_ALLOWED",
        "Ativo incompatível com o tipo",
      );
    const amount = parseDecimal(item.amount, "opening balance");
    if (amount.lt(0))
      throw new ValidationError(
        "VALIDATION_ERROR",
        "Saldo inicial não pode ser negativo",
      );
    validateScale(amount, asset, "opening balance");
    return {
      asset,
      amount,
      occurredAt: parseCivilDateToCanonicalInstant(item.openingDate),
    };
  });
}

export function cardInput(
  body: Record<string, unknown>,
  config: ReturnType<typeof getAccountTypeConfiguration>,
  assets: Array<{ id: string; type: AssetType }> = [],
  required = config.requiresCardProfile,
) {
  const raw = body.card;
  if (raw == null) {
    if (required)
      throw new ValidationError(
        "CARD_PROFILE_REQUIRED",
        "Perfil de cartão obrigatório",
      );
    return undefined;
  }
  if (typeof raw !== "object")
    throw new ValidationError(
      "INVALID_CARD_PROFILE",
      "Perfil de cartão inválido",
    );
  const card = raw as Record<string, unknown>;
  const type = enumValue(card.type, cardTypes, "card.type");
  if (!config.allowedCardTypes.includes(type))
    throw new ValidationError(
      "INVALID_CARD_PROFILE",
      "Tipo de cartão incompatível",
    );
  const lastFour =
    card.lastFour == null || card.lastFour === ""
      ? null
      : stringValue(card.lastFour, "card.lastFour", 4);
  if (lastFour && !/^\d{4}$/.test(lastFour))
    throw new ValidationError(
      "INVALID_CARD_PROFILE",
      "Últimos quatro dígitos inválidos",
    );
  const day = (value: unknown, field: string) =>
    value == null || value === ""
      ? null
      : typeof value === "number" &&
          Number.isInteger(value) &&
          value >= 1 &&
          value <= 31
        ? value
        : (() => {
            throw new ValidationError(
              "INVALID_CARD_PROFILE",
              `${field} inválido`,
            );
          })();
  const closingDay = day(card.closingDay, "closingDay");
  const dueDay = day(card.dueDay, "dueDay");
  if (
    ["GIFT_CARD", "BENEFIT_ACCOUNT", "PREPAID_CARD"].includes(config.value) &&
    (closingDay || dueDay)
  )
    throw new ValidationError(
      "INVALID_CARD_PROFILE",
      "Fechamento e vencimento não se aplicam",
    );
  if (config.value === "CREDIT_CARD" && (!closingDay || !dueDay))
    throw new ValidationError(
      "INVALID_CARD_PROFILE",
      "Fechamento e vencimento são obrigatórios",
    );
  const creditLimit =
    card.creditLimit == null || card.creditLimit === ""
      ? null
      : parseDecimal(card.creditLimit, "card.creditLimit");
  if (creditLimit?.lt(0))
    throw new ValidationError("INVALID_CARD_PROFILE", "Limite inválido");
  const limitAssetId =
    card.limitAssetId == null || card.limitAssetId === ""
      ? null
      : cuidValue(String(card.limitAssetId), "card.limitAssetId");
  if (creditLimit && !limitAssetId)
    throw new ValidationError(
      "INVALID_CARD_PROFILE",
      "Ativo do limite é obrigatório",
    );
  if (
    limitAssetId &&
    assets.length &&
    !assets.some(
      (asset) => asset.id === limitAssetId && asset.type === AssetType.FIAT,
    )
  )
    throw new ValidationError(
      "INVALID_CARD_PROFILE",
      "Ativo do limite inválido",
    );
  return {
    type,
    brand:
      card.brand == null
        ? null
        : stringValue(card.brand, "card.brand", 40, false),
    lastFour,
    closingDay,
    dueDay,
    creditLimit,
    limitAssetId,
  };
}

export function parseAddAccountBalanceInput(body: Record<string, unknown>) {
  return {
    assetId: cuidValue(String(body.assetId), "assetId"),
    amount: parseDecimal(body.amount, "amount"),
    occurredAt: parseCivilDateToCanonicalInstant(body.openingDate),
  };
}

export function publicAccount(account: any) {
  return {
    ...account,
    createdAt: account.createdAt.toISOString(),
    updatedAt: account.updatedAt.toISOString(),
    archivedAt: account.archivedAt?.toISOString() ?? null,
    balances: account.balances.map((balance: any) => ({
      ...balance,
      currentBalance: balance.currentBalance.toString(),
      availableBalance: balance.availableBalance?.toString() ?? null,
      lastCalculatedAt: balance.lastCalculatedAt.toISOString(),
      createdAt: balance.createdAt.toISOString(),
      updatedAt: balance.updatedAt.toISOString(),
      openingDate: balance.entries?.[0]?.transaction?.occurredAt
        ? formatCanonicalInstantAsCivilDate(
            balance.entries[0].transaction.occurredAt,
          )
        : null,
      asset: balance.asset,
    })),
    cardProfile: account.cardProfile
      ? {
          ...account.cardProfile,
          creditLimit: account.cardProfile.creditLimit?.toString() ?? null,
          createdAt: account.cardProfile.createdAt.toISOString(),
          updatedAt: account.cardProfile.updatedAt.toISOString(),
        }
      : null,
  };
}

export const activeAccount = { status: AccountStatus.ACTIVE };
