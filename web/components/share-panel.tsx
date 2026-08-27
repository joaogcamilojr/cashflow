/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
"use client";

import { FormEvent, useEffect, useState } from "react";

import { useToast } from "@/components/ui/toast-provider";

type Member = {
  id: string;
  role: string;
  user: { email: string; displayName: string | null };
};

export function SharePanel({ accountId }: { accountId: string }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("VIEWER");
  const [message, setMessage] = useState("");
  const { toast } = useToast();
  async function load() {
    const response = await fetch(`/api/v1/accounts/${accountId}/members`);
    const body = await response.json();
    if (response.ok) setMembers(body.data);
  }
  useEffect(() => {
    load();
  }, [accountId]);
  async function share(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    const response = await fetch(`/api/v1/accounts/${accountId}/shares`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, role }),
    });
    const body = await response.json();
    if (!response.ok) {
      setMessage(body.error?.message || "Não foi possível compartilhar.");
      toast({
        variant: "error",
        title: "Compartilhamento não concluído",
        description: "Verifique os dados e a permissão.",
      });
      return;
    }
    setEmail("");
    setMessage(
      body.data.accepted ? "Acesso concedido." : "Convite pendente criado.",
    );
    toast({
      variant: "success",
      title: body.data.accepted
        ? "Acesso concedido"
        : "Convite pendente criado",
    });
    load();
  }
  return (
    <section className="share-panel">
      <h2>Compartilhar conta</h2>
      <form className="share-form" onSubmit={share}>
        <label>
          E-mail
          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="pessoa@exemplo.com"
          />
        </label>
        <label>
          Permissão
          <select
            value={role}
            onChange={(event) => setRole(event.target.value)}
          >
            <option value="VIEWER">Viewer — consulta</option>
            <option value="TRANSACTION_MANAGER">
              Transaction manager — lançamentos
            </option>
          </select>
        </label>
        <button className="button button-small">Compartilhar</button>
      </form>
      {message && (
        <p className="share-message" role="status">
          {message}
        </p>
      )}
      <div className="member-list">
        {members.map((member) => (
          <div key={member.id}>
            <span>{member.user.displayName || member.user.email}</span>
            <em>{member.role.replaceAll("_", " ")}</em>
          </div>
        ))}
      </div>
    </section>
  );
}
