/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { getAccountTypeConfiguration } from "@/lib/accounts/account-types";

type Account = {
  id: string;
  name: string;
  type: string;
  status: string;
  institutionName: string | null;
  balances: Array<{
    id: string;
    currentBalance: string;
    asset: { code: string; symbol: string };
  }>;
};

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  async function load() {
    setLoading(true);
    setError(false);
    try {
      const response = await fetch("/api/v1/accounts");
      if (!response.ok) throw new Error();
      setAccounts((await response.json()).data || []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);
  const visible =
    filter === "ALL"
      ? accounts
      : accounts.filter(
          (account) => account.type === filter || account.status === filter,
        );
  return (
    <PageContainer size="wide">
      <PageHeader
        eyebrow="Patrimônio"
        title="Contas e cartões"
        description="Cada saldo separado por ativo. Histórico preservado."
        actions={
          <Link className="button" href="/accounts/new">
            Nova conta
          </Link>
        }
      />
      <div className="filters">
        <select
          aria-label="Filtrar contas"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
        >
          <option value="ALL">Todas</option>
          <option value="ACTIVE">Ativas</option>
          <option value="ARCHIVED">Arquivadas</option>
          <option value="CREDIT_CARD">Cartões de crédito</option>
          <option value="CRYPTO_WALLET">Carteiras cripto</option>
        </select>
      </div>
      {loading ? (
        <LoadingState label="Carregando contas" />
      ) : error ? (
        <ErrorState retry={load} />
      ) : visible.length === 0 ? (
        <EmptyState
          title={
            filter === "ALL"
              ? "Nenhuma conta encontrada"
              : "Nenhuma conta neste filtro"
          }
          description="Adicione uma conta ou ajuste o filtro para continuar."
          action={
            filter === "ALL" ? (
              <Link className="button button-small" href="/accounts/new">
                Adicionar conta
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="account-grid">
          {visible.map((account) => (
            <Link
              className="account-card"
              href={`/accounts/${account.id}`}
              key={account.id}
            >
              <span className="account-icon">
                {getAccountTypeConfiguration(account.type).label.slice(0, 1)}
              </span>
              <div>
                <h3>{account.name}</h3>
                <small>
                  {account.institutionName ||
                    getAccountTypeConfiguration(account.type).label}
                </small>
              </div>
              <div className="account-balances">
                {account.balances.map((balance) => (
                  <span key={balance.id}>
                    <b>{balance.asset.code}</b> {balance.currentBalance}
                  </span>
                ))}
              </div>
              <em
                className={
                  account.status === "ARCHIVED" ? "archived" : "active-status"
                }
              >
                {account.status === "ARCHIVED" ? "Arquivada" : "Ativa"}
              </em>
            </Link>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
