"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { AccountForm } from "@/components/accounts/account-form";
import { Asset } from "@/components/accounts/opening-balances-editor";
import { ErrorState } from "@/components/ui/error-state";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";

export default function NewAccountPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [error, setError] = useState(false);
  useEffect(() => {
    fetch("/api/v1/assets")
      .then(async (response) => {
        if (!response.ok) throw new Error();
        setAssets((await response.json()).data || []);
      })
      .catch(() => setError(true));
  }, []);
  return (
    <PageContainer size="form">
      <PageHeader
        back={
          <Link className="back-link" href="/accounts">
            ← Contas
          </Link>
        }
        eyebrow="Nova conta"
        title="Adicione um saldo global."
        description="Saldo inicial zero é válido. Nenhum número completo de cartão é armazenado."
      />
      {error ? (
        <ErrorState
          title="Catálogo indisponível"
          description="Não foi possível carregar os ativos."
          retry={() => window.location.reload()}
        />
      ) : (
        <AccountForm
          mode="create"
          assets={assets}
          onSaved={(account) => {
            window.location.href = `/accounts/${account.id}`;
          }}
        />
      )}
    </PageContainer>
  );
}
