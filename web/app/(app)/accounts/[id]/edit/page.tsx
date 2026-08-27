"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import { useEffect, useState } from "react";

import { AccountForm } from "@/components/accounts/account-form";
import { Asset } from "@/components/accounts/opening-balances-editor";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { useToast } from "@/components/ui/toast-provider";
import { getAccountTypeConfiguration } from "@/lib/accounts/account-types";

type Account = {
  id: string;
  name: string;
  type: any;
  status: string;
  countryCode: string;
  institutionName: string;
  description: string;
  includeInNetWorth: boolean;
  includeInAvailableBalance: boolean;
  balances: Array<{
    id: string;
    assetId: string;
    currentBalance: string;
    openingDate: string | null;
    asset: Asset;
  }>;
  cardProfile: any;
};

const today = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

export default function EditAccount({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [id, setId] = useState("");
  const [account, setAccount] = useState<Account | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [error, setError] = useState("");
  const [newAsset, setNewAsset] = useState("");
  const [newAmount, setNewAmount] = useState("0");
  const [newDate, setNewDate] = useState(today);
  const { toast } = useToast();
  async function load(nextId: string) {
    try {
      const [accountResponse, assetsResponse] = await Promise.all([
        fetch(`/api/v1/accounts/${nextId}`),
        fetch("/api/v1/assets"),
      ]);
      const accountBody = await accountResponse.json();
      const assetsBody = await assetsResponse.json();
      if (!accountResponse.ok) throw new Error("Conta não encontrada.");
      setAccount({
        ...accountBody.data,
        description: accountBody.data.description || "",
        institutionName: accountBody.data.institutionName || "",
        countryCode: accountBody.data.countryCode || "",
      });
      setAssets(assetsBody.data || []);
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Não foi possível carregar.",
      );
    }
  }
  useEffect(() => {
    params.then(({ id: nextId }) => {
      setId(nextId);
      load(nextId);
    });
  }, [params]);
  async function addCurrency() {
    const response = await fetch(`/api/v1/accounts/${id}/balances`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        assetId: newAsset,
        amount: newAmount,
        openingDate: newDate,
      }),
    });
    const body = await response.json();
    if (!response.ok) {
      setError(body.error?.message || "Não foi possível adicionar moeda.");
      return;
    }
    setAccount(body.data);
    setNewAsset("");
    setNewAmount("0");
    toast({ variant: "success", title: "Moeda adicionada" });
  }
  if (error && !account)
    return (
      <PageContainer>
        <ErrorState
          title="Conta indisponível"
          description={error}
          retry={() => load(id)}
          action={
            <Link className="button button-small secondary" href="/accounts">
              Voltar para contas
            </Link>
          }
        />
      </PageContainer>
    );
  if (!account)
    return (
      <PageContainer>
        <LoadingState label="Carregando edição" />
      </PageContainer>
    );
  const config = getAccountTypeConfiguration(account.type);
  const options = assets.filter(
    (asset) =>
      config.allowedAssetTypes.includes(asset.type) &&
      !account.balances.some((balance) => balance.assetId === asset.id),
  );
  const card = account.cardProfile
    ? {
        type: account.cardProfile.type,
        brand: account.cardProfile.brand || "",
        lastFour: account.cardProfile.lastFour || "",
        closingDay: account.cardProfile.closingDay?.toString() || "",
        dueDay: account.cardProfile.dueDay?.toString() || "",
        creditLimit: account.cardProfile.creditLimit || "",
        limitAssetId: account.cardProfile.limitAssetId || "",
      }
    : null;
  return (
    <PageContainer size="form">
      <PageHeader
        back={
          <Link className="back-link" href={`/accounts/${id}`}>
            ← Conta
          </Link>
        }
        eyebrow="Editar"
        title="Detalhes da conta"
        description="Tipo e saldos históricos ficam protegidos."
      />
      <AccountForm
        mode="edit"
        assets={assets}
        initial={{ ...account, id, card }}
        existingBalances={account.balances}
        onSaved={() => {
          window.location.href = `/accounts/${id}`;
        }}
      />
      {config.assetSelection === "multiple" && account.status === "ACTIVE" && (
        <section className="form-card add-balance-card">
          <h2>Adicionar moeda</h2>
          <p className="section-help">
            Nova moeda começa com saldo inicial. Saldos existentes não são
            alterados.
          </p>
          <div className="form-two">
            <label>
              Ativo
              <select
                value={newAsset}
                onChange={(event) => setNewAsset(event.target.value)}
              >
                <option value="">Selecione</option>
                {options.map((asset) => (
                  <option value={asset.id} key={asset.id}>
                    {asset.symbol} {asset.code}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Saldo
              <input
                inputMode="decimal"
                value={newAmount}
                onChange={(event) => setNewAmount(event.target.value)}
              />
            </label>
          </div>
          <label>
            Data
            <input
              type="date"
              value={newDate}
              onChange={(event) => setNewDate(event.target.value)}
            />
          </label>
          <button
            type="button"
            className="button button-small"
            disabled={!newAsset}
            onClick={addCurrency}
          >
            Adicionar moeda
          </button>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
        </section>
      )}
    </PageContainer>
  );
}
