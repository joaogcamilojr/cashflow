/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { getAccountTypeConfiguration } from "@/lib/accounts/account-types";

type Balance = {
  id: string;
  currentBalance: string;
  availableBalance: string | null;
  asset: { code: string; symbol: string; name: string };
};
type Account = {
  id: string;
  name: string;
  type: string;
  status: string;
  includeInAvailableBalance: boolean;
  balances: Balance[];
};

export default function DashboardPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
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
  const balances = useMemo(
    () =>
      accounts.flatMap((account) =>
        account.includeInAvailableBalance ? account.balances : [],
      ),
    [accounts],
  );
  return (
    <PageContainer size="wide">
      <PageHeader
        eyebrow="Visão geral"
        title="Seu dinheiro, sem fronteiras."
        description="Saldos por ativo. Sem conversão inventada."
        actions={
          <Link className="button" href="/accounts/new">
            Adicionar conta
          </Link>
        }
      />
      {loading ? (
        <LoadingState label="Carregando dashboard" />
      ) : error ? (
        <ErrorState retry={load} />
      ) : (
        <>
          <section className="metric-grid">
            <article>
              <small>Contas ativas</small>
              <strong>
                {
                  accounts.filter((account) => account.status === "ACTIVE")
                    .length
                }
              </strong>
              <span>contas, carteiras e cartões</span>
            </article>
            <article>
              <small>Ativos acompanhados</small>
              <strong>
                {new Set(balances.map((balance) => balance.asset.code)).size}
              </strong>
              <span>sem misturar moedas</span>
            </article>
            <article>
              <small>Saldos disponíveis</small>
              <strong>{balances.length}</strong>
              <span>projeções do ledger</span>
            </article>
          </section>
          <section className="content-section">
            <div className="section-heading">
              <div>
                <span className="section-kicker">Contas recentes</span>
                <h2>Seus saldos</h2>
              </div>
              <Link href="/accounts">Ver todas →</Link>
            </div>
            {accounts.length === 0 ? (
              <EmptyState
                title="Comece adicionando uma conta"
                description="Crie uma conta para acompanhar seus ativos provisionados."
                action={
                  <Link className="button button-small" href="/accounts/new">
                    Criar primeira conta
                  </Link>
                }
              />
            ) : (
              <div className="account-grid">
                {accounts.slice(0, 6).map((account) => (
                  <Link
                    className="account-card"
                    href={`/accounts/${account.id}`}
                    key={account.id}
                  >
                    <span className="account-icon">
                      {getAccountTypeConfiguration(account.type).label.slice(
                        0,
                        1,
                      )}
                    </span>
                    <div>
                      <h3>{account.name}</h3>
                      <small>
                        {getAccountTypeConfiguration(account.type).label}
                      </small>
                    </div>
                    <div className="account-balances">
                      {account.balances.length ? (
                        account.balances.map((balance) => (
                          <span key={balance.id}>
                            <b>{balance.asset.code}</b> {balance.currentBalance}
                          </span>
                        ))
                      ) : (
                        <span>Sem saldo</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </PageContainer>
  );
}
