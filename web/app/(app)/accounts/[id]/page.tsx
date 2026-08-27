"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { SharePanel } from "@/components/share-panel";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingState } from "@/components/ui/loading-state";
import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { useToast } from "@/components/ui/toast-provider";
import { getAccountTypeConfiguration } from "@/lib/accounts/account-types";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function AccountDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [id, setId] = useState("");
  const [account, setAccount] = useState<any>(null);
  const [error, setError] = useState(false);
  const [confirm, setConfirm] = useState<
    "archive" | "restore" | "delete" | null
  >(null);
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();
  async function load(nextId: string) {
    try {
      const response = await fetch(`/api/v1/accounts/${nextId}`);
      if (!response.ok) throw new Error();
      setAccount((await response.json()).data);
    } catch {
      setError(true);
    }
  }
  useEffect(() => {
    params.then(({ id: nextId }) => {
      setId(nextId);
      load(nextId);
    });
  }, [params]);
  async function action() {
    if (!confirm) return;
    setBusy(true);
    const method = confirm === "delete" ? "DELETE" : "POST";
    const response = await fetch(
      `/api/v1/accounts/${id}${confirm === "delete" ? "" : `/${confirm}`}`,
      { method },
    );
    setBusy(false);
    if (!response.ok) {
      setConfirm(null);
      toast({
        variant: "error",
        title: "Ação não concluída",
        description: "Verifique a permissão e o estado da conta.",
      });
      return;
    }
    if (confirm === "delete") {
      toast({ variant: "success", title: "Conta excluída" });
      window.location.href = "/accounts";
      return;
    }
    setAccount({
      ...account,
      status: confirm === "archive" ? "ARCHIVED" : "ACTIVE",
    });
    toast({
      variant: "success",
      title: confirm === "archive" ? "Conta arquivada" : "Conta restaurada",
    });
    setConfirm(null);
  }
  if (error)
    return (
      <PageContainer>
        <ErrorState
          title="Conta indisponível"
          description="A conta não existe ou não está disponível para você."
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
        <LoadingState label="Carregando conta" />
      </PageContainer>
    );
  const typeLabel = getAccountTypeConfiguration(account.type).label;
  return (
    <PageContainer size="form">
      <PageHeader
        back={
          <Link className="back-link" href="/accounts">
            ← Contas
          </Link>
        }
        eyebrow={account.status === "ARCHIVED" ? "Arquivada" : typeLabel}
        title={account.name}
        description={account.institutionName || typeLabel}
        actions={
          <>
            <Link className="button button-small" href={`/accounts/${id}/edit`}>
              Editar
            </Link>
            <button
              className="button button-small secondary"
              onClick={() =>
                setConfirm(account.status === "ACTIVE" ? "archive" : "restore")
              }
            >
              {account.status === "ACTIVE" ? "Arquivar" : "Restaurar"}
            </button>
          </>
        }
      />
      <section className="balance-detail">
        <h2>Saldos por ativo</h2>
        {account.balances.length ? (
          account.balances.map((balance: any) => (
            <div className="balance-row" key={balance.id}>
              <span>
                <b>
                  {balance.asset.symbol} {balance.asset.code}
                </b>
                <small>{balance.asset.name}</small>
              </span>
              <strong>{balance.currentBalance}</strong>
            </div>
          ))
        ) : (
          <p>Saldo zero. Nenhum lançamento artificial foi criado.</p>
        )}
      </section>
      <SharePanel accountId={id} />
      <section className="danger-zone">
        <h2>Exclusão</h2>
        <p>Contas com histórico só podem ser arquivadas.</p>
        <button className="text-danger" onClick={() => setConfirm("delete")}>
          Excluir se estiver vazia
        </button>
      </section>
      <ConfirmDialog
        open={confirm !== null}
        title={
          confirm === "delete"
            ? "Excluir conta?"
            : `${confirm === "archive" ? "Arquivar" : "Restaurar"} conta?`
        }
        description={
          confirm === "delete"
            ? "Esta ação só funciona para contas sem histórico."
            : "Você poderá revisar o estado da conta depois."
        }
        confirmLabel={
          confirm === "delete"
            ? "Excluir"
            : confirm === "archive"
              ? "Arquivar"
              : "Restaurar"
        }
        destructive={confirm === "delete" || confirm === "archive"}
        busy={busy}
        onConfirm={action}
        onCancel={() => setConfirm(null)}
      />
    </PageContainer>
  );
}
