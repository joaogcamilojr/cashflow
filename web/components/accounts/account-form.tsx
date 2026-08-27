"use client";

import { AccountType, CardType } from "@prisma/client";
import { FormEvent, useMemo, useState } from "react";

import { AccountFormSection } from "@/components/accounts/account-form-section";
import { AccountTypeSelect } from "@/components/accounts/account-type-select";
import {
  CardForm,
  CardProfileFields,
} from "@/components/accounts/card-profile-fields";
import { CountrySelect } from "@/components/accounts/country-select";
import {
  Asset,
  OpeningBalanceFormItem,
  OpeningBalancesEditor,
} from "@/components/accounts/opening-balances-editor";
import { getAccountTypeConfiguration } from "@/lib/accounts/account-types";

type ExistingBalance = {
  id: string;
  asset: Asset;
  currentBalance: string;
  openingDate: string | null;
};

export type AccountFormData = {
  id?: string;
  name: string;
  description: string;
  type: AccountType;
  institutionName: string;
  countryCode: string;
  externalReference: string;
  includeInNetWorth: boolean;
  includeInAvailableBalance: boolean;
  openingBalances: OpeningBalanceFormItem[];
  card: CardForm | null;
};

const today = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

const emptyCard = (type: CardType): CardForm => ({
  type,
  brand: "",
  lastFour: "",
  closingDay: "",
  dueDay: "",
  creditLimit: "",
  limitAssetId: "",
});

export function AccountForm({
  mode,
  assets,
  initial,
  existingBalances = [],
  onSaved,
}: {
  mode: "create" | "edit";
  assets: Asset[];
  initial?: Partial<AccountFormData>;
  existingBalances?: ExistingBalance[];
  onSaved: (data: { id: string }) => void;
}) {
  const [form, setForm] = useState<AccountFormData>({
    name: "",
    description: "",
    type: "CASH_WALLET",
    institutionName: "",
    countryCode: "",
    externalReference: "",
    includeInNetWorth: true,
    includeInAvailableBalance: true,
    openingBalances:
      mode === "create"
        ? [
            {
              localId: crypto.randomUUID(),
              assetId: "",
              amount: "0",
              openingDate: today(),
            },
          ]
        : [],
    card: null,
    ...initial,
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const config = getAccountTypeConfiguration(form.type);
  const cardTypes = config.allowedCardTypes;
  function changeType(type: AccountType) {
    const next = getAccountTypeConfiguration(type);
    setForm({
      ...form,
      type,
      includeInNetWorth: next.defaultIncludeInNetWorth,
      includeInAvailableBalance: next.defaultIncludeInAvailableBalance,
      openingBalances:
        mode === "create"
          ? [
              {
                localId: crypto.randomUUID(),
                assetId: "",
                amount: "0",
                openingDate: today(),
              },
            ]
          : [],
      card:
        next.requiresCardProfile || next.allowsCardProfile
          ? emptyCard(next.allowedCardTypes[0] || CardType.VIRTUAL)
          : null,
    });
  }
  const balanceMessage = useMemo(
    () =>
      existingBalances.length
        ? "Saldos históricos são somente leitura."
        : "Saldo zero não cria lançamento artificial.",
    [existingBalances.length],
  );
  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const payload: Record<string, unknown> = {
      name: form.name,
      description: form.description || undefined,
      institutionName: form.institutionName || undefined,
      countryCode: form.countryCode || undefined,
      externalReference: form.externalReference || undefined,
      includeInNetWorth: form.includeInNetWorth,
      includeInAvailableBalance: form.includeInAvailableBalance,
    };
    if (mode === "create") {
      payload.type = form.type;
      payload.openingBalances = form.openingBalances
        .filter((item) => item.assetId)
        .map(({ assetId, amount, openingDate }) => ({
          assetId,
          amount,
          openingDate,
        }));
    }
    if (form.card)
      payload.card = {
        ...form.card,
        closingDay: form.card.closingDay ? Number(form.card.closingDay) : null,
        dueDay: form.card.dueDay ? Number(form.card.dueDay) : null,
      };
    const response = await fetch(
      mode === "create"
        ? "/api/v1/accounts"
        : `/api/v1/accounts/${initial?.id}`,
      {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    const body = await response.json();
    setSaving(false);
    if (!response.ok) {
      setError(body.error?.message || "Não foi possível salvar.");
      return;
    }
    onSaved(body.data);
  }
  return (
    <form
      className="form-card account-form"
      onSubmit={submit}
      onChange={() => setError("")}
    >
      <AccountFormSection title="Identificação">
        <label>
          Nome *
          <input
            required
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
          />
        </label>
        <label>
          Descrição
          <textarea
            value={form.description}
            onChange={(event) =>
              setForm({ ...form, description: event.target.value })
            }
          />
        </label>
      </AccountFormSection>
      <AccountFormSection title="Tipo e instituição">
        <AccountTypeSelect
          value={form.type}
          disabled={mode === "edit" && existingBalances.length > 0}
          onChange={changeType}
        />
        <div className="form-two">
          <label>
            Instituição{config.requiresInstitution && " *"}
            <input
              required={config.requiresInstitution}
              value={form.institutionName}
              onChange={(event) =>
                setForm({ ...form, institutionName: event.target.value })
              }
            />
          </label>
          <CountrySelect
            required={config.requiresCountry}
            value={form.countryCode}
            onChange={(countryCode) => setForm({ ...form, countryCode })}
          />
        </div>
      </AccountFormSection>
      {mode === "create" ? (
        <AccountFormSection
          title="Moedas e saldo inicial"
          description={balanceMessage}
        >
          <OpeningBalancesEditor
            type={form.type}
            assets={assets}
            items={form.openingBalances}
            onChange={(openingBalances) =>
              setForm({ ...form, openingBalances })
            }
          />
        </AccountFormSection>
      ) : (
        <AccountFormSection
          title="Moedas e saldos"
          description={balanceMessage}
        >
          {existingBalances.map((balance) => (
            <div className="balance-row" key={balance.id}>
              <span>
                <b>
                  {balance.asset.symbol} {balance.asset.code}
                </b>
                <small>
                  {balance.openingDate
                    ? `Saldo inicial em ${balance.openingDate}`
                    : "Histórico preservado"}
                </small>
              </span>
              <strong>{balance.currentBalance}</strong>
            </div>
          ))}
          {!existingBalances.length && (
            <p className="field-note">Nenhum saldo existente.</p>
          )}
          {config.assetSelection === "multiple" && (
            <p className="field-note">
              Uma moeda com histórico não pode ser removida. Arquive a conta ou
              faça um ajuste em etapa futura.
            </p>
          )}
        </AccountFormSection>
      )}
      {(config.requiresCardProfile || config.allowsCardProfile) &&
        form.card && (
          <AccountFormSection
            title="Cartão"
            description={
              config.requiresCardProfile
                ? "Perfil obrigatório para este tipo."
                : "Perfil opcional."
            }
          >
            <CardProfileFields
              value={form.card}
              types={cardTypes}
              assets={assets.filter((asset) => asset.type === "FIAT")}
              onChange={(card) => setForm({ ...form, card })}
            />
          </AccountFormSection>
        )}
      <AccountFormSection title="Comportamento">
        <label className="check">
          <input
            type="checkbox"
            checked={form.includeInNetWorth}
            onChange={(event) =>
              setForm({ ...form, includeInNetWorth: event.target.checked })
            }
          />{" "}
          Incluir no patrimônio
        </label>
        <label className="check">
          <input
            type="checkbox"
            checked={form.includeInAvailableBalance}
            onChange={(event) =>
              setForm({
                ...form,
                includeInAvailableBalance: event.target.checked,
              })
            }
          />{" "}
          Incluir no saldo disponível
        </label>
        {form.type === "OTHER" && (
          <p className="field-note">
            Revise estes indicadores para este tipo personalizado.
          </p>
        )}
      </AccountFormSection>
      {error && (
        <p className="form-error" role="alert" aria-live="polite">
          {error}
        </p>
      )}
      <button className="button" disabled={saving}>
        {saving
          ? "Salvando..."
          : mode === "create"
            ? "Criar conta"
            : "Salvar alterações"}
      </button>
    </form>
  );
}
