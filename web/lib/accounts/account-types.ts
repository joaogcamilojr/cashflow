import { AccountType, AssetType, CardType } from "@prisma/client";

export type AccountTypeConfiguration = {
  value: AccountType;
  label: string;
  description: string;
  allowedAssetTypes: AssetType[];
  assetSelection: "single" | "multiple";
  requiresCountry: boolean;
  allowsCountry: boolean;
  requiresInstitution: boolean;
  allowsInstitution: boolean;
  requiresCardProfile: boolean;
  allowsCardProfile: boolean;
  allowedCardTypes: CardType[];
  defaultIncludeInNetWorth: boolean;
  defaultIncludeInAvailableBalance: boolean;
};

const fiat = [AssetType.FIAT];
const fiatPoints = [AssetType.FIAT, AssetType.POINTS];

export const ACCOUNT_TYPE_CONFIGURATIONS: Record<
  AccountType,
  AccountTypeConfiguration
> = {
  CASH_WALLET: {
    value: AccountType.CASH_WALLET,
    label: "Carteira de dinheiro",
    description: "Dinheiro físico ou saldo simples em uma moeda.",
    allowedAssetTypes: fiat,
    assetSelection: "single",
    requiresCountry: false,
    allowsCountry: true,
    requiresInstitution: false,
    allowsInstitution: false,
    requiresCardProfile: false,
    allowsCardProfile: false,
    allowedCardTypes: [],
    defaultIncludeInNetWorth: true,
    defaultIncludeInAvailableBalance: true,
  },
  BANK_ACCOUNT: {
    value: AccountType.BANK_ACCOUNT,
    label: "Conta bancária",
    description: "Conta bancária tradicional em uma moeda fiduciária.",
    allowedAssetTypes: fiat,
    assetSelection: "single",
    requiresCountry: true,
    allowsCountry: true,
    requiresInstitution: true,
    allowsInstitution: true,
    requiresCardProfile: false,
    allowsCardProfile: false,
    allowedCardTypes: [],
    defaultIncludeInNetWorth: true,
    defaultIncludeInAvailableBalance: true,
  },
  INTERNATIONAL_ACCOUNT: {
    value: AccountType.INTERNATIONAL_ACCOUNT,
    label: "Conta internacional",
    description:
      "Conta local ou internacional com uma ou mais moedas fiduciárias.",
    allowedAssetTypes: fiat,
    assetSelection: "multiple",
    requiresCountry: true,
    allowsCountry: true,
    requiresInstitution: true,
    allowsInstitution: true,
    requiresCardProfile: false,
    allowsCardProfile: false,
    allowedCardTypes: [],
    defaultIncludeInNetWorth: true,
    defaultIncludeInAvailableBalance: true,
  },
  MULTI_CURRENCY_ACCOUNT: {
    value: AccountType.MULTI_CURRENCY_ACCOUNT,
    label: "Conta multimoeda",
    description: "Vários saldos fiduciários separados por moeda.",
    allowedAssetTypes: fiat,
    assetSelection: "multiple",
    requiresCountry: true,
    allowsCountry: true,
    requiresInstitution: true,
    allowsInstitution: true,
    requiresCardProfile: false,
    allowsCardProfile: false,
    allowedCardTypes: [],
    defaultIncludeInNetWorth: true,
    defaultIncludeInAvailableBalance: true,
  },
  BENEFIT_ACCOUNT: {
    value: AccountType.BENEFIT_ACCOUNT,
    label: "Conta ou saldo de benefício",
    description: "Vale, benefício corporativo ou saldo de mobilidade.",
    allowedAssetTypes: fiatPoints,
    assetSelection: "single",
    requiresCountry: true,
    allowsCountry: true,
    requiresInstitution: true,
    allowsInstitution: true,
    requiresCardProfile: false,
    allowsCardProfile: true,
    allowedCardTypes: [CardType.BENEFIT, CardType.VIRTUAL],
    defaultIncludeInNetWorth: false,
    defaultIncludeInAvailableBalance: true,
  },
  GIFT_CARD: {
    value: AccountType.GIFT_CARD,
    label: "Gift card",
    description: "Cartão-presente ou crédito de loja.",
    allowedAssetTypes: fiatPoints,
    assetSelection: "single",
    requiresCountry: true,
    allowsCountry: true,
    requiresInstitution: true,
    allowsInstitution: true,
    requiresCardProfile: false,
    allowsCardProfile: true,
    allowedCardTypes: [CardType.GIFT, CardType.VIRTUAL],
    defaultIncludeInNetWorth: false,
    defaultIncludeInAvailableBalance: true,
  },
  DIGITAL_BALANCE: {
    value: AccountType.DIGITAL_BALANCE,
    label: "Saldo digital",
    description: "Saldo mantido em aplicativo, plataforma ou serviço.",
    allowedAssetTypes: [AssetType.FIAT, AssetType.POINTS, AssetType.OTHER],
    assetSelection: "single",
    requiresCountry: true,
    allowsCountry: true,
    requiresInstitution: true,
    allowsInstitution: true,
    requiresCardProfile: false,
    allowsCardProfile: false,
    allowedCardTypes: [],
    defaultIncludeInNetWorth: false,
    defaultIncludeInAvailableBalance: true,
  },
  CRYPTO_WALLET: {
    value: AccountType.CRYPTO_WALLET,
    label: "Carteira de criptoativos",
    description:
      "Um ou mais criptoativos. Nunca informe chave privada ou seed phrase.",
    allowedAssetTypes: [AssetType.CRYPTO],
    assetSelection: "multiple",
    requiresCountry: false,
    allowsCountry: true,
    requiresInstitution: false,
    allowsInstitution: true,
    requiresCardProfile: false,
    allowsCardProfile: false,
    allowedCardTypes: [],
    defaultIncludeInNetWorth: true,
    defaultIncludeInAvailableBalance: false,
  },
  CREDIT_CARD: {
    value: AccountType.CREDIT_CARD,
    label: "Cartão de crédito",
    description: "Limite e fatura em uma moeda fiduciária.",
    allowedAssetTypes: fiat,
    assetSelection: "single",
    requiresCountry: true,
    allowsCountry: true,
    requiresInstitution: true,
    allowsInstitution: true,
    requiresCardProfile: true,
    allowsCardProfile: false,
    allowedCardTypes: [CardType.CREDIT],
    defaultIncludeInNetWorth: false,
    defaultIncludeInAvailableBalance: false,
  },
  PREPAID_CARD: {
    value: AccountType.PREPAID_CARD,
    label: "Cartão pré-pago",
    description: "Cartão pré-pago físico ou virtual.",
    allowedAssetTypes: fiat,
    assetSelection: "multiple",
    requiresCountry: true,
    allowsCountry: true,
    requiresInstitution: true,
    allowsInstitution: true,
    requiresCardProfile: true,
    allowsCardProfile: false,
    allowedCardTypes: [CardType.PREPAID, CardType.VIRTUAL],
    defaultIncludeInNetWorth: true,
    defaultIncludeInAvailableBalance: true,
  },
  OTHER: {
    value: AccountType.OTHER,
    label: "Outro",
    description:
      "Tipo personalizado. Revise os indicadores de patrimônio e saldo disponível.",
    allowedAssetTypes: [
      AssetType.FIAT,
      AssetType.CRYPTO,
      AssetType.POINTS,
      AssetType.OTHER,
    ],
    assetSelection: "multiple",
    requiresCountry: false,
    allowsCountry: true,
    requiresInstitution: false,
    allowsInstitution: true,
    requiresCardProfile: false,
    allowsCardProfile: true,
    allowedCardTypes: Object.values(CardType),
    defaultIncludeInNetWorth: true,
    defaultIncludeInAvailableBalance: true,
  },
};

export function getAccountTypeConfiguration(
  type: AccountType | string,
): AccountTypeConfiguration {
  return (
    ACCOUNT_TYPE_CONFIGURATIONS[type as AccountType] ??
    ACCOUNT_TYPE_CONFIGURATIONS.OTHER
  );
}
