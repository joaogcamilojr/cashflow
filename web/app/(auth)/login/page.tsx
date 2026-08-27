/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const endpoint = sent ? "/api/v1/auth/login/verify" : "/api/v1/auth/login";
    const body = await (
      await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(sent ? { email, code } : { email }),
      })
    ).json();
    setLoading(false);
    if (body.error) {
      setError(body.error.message ?? "Não foi possível entrar.");
      return;
    }
    if (!sent) {
      setSent(true);
      return;
    }
    router.push(params.get("next") || "/dashboard");
  }
  return (
    <main className="auth-shell">
      <a className="brand" href="/">
        <span className="mark">
          <i />
          <i />
          <i />
          <i />
        </span>
        <span>Cash Flow</span>
        <b>Global</b>
      </a>
      <section className="auth-card">
        <span className="section-kicker">Acesso seguro</span>
        <h1>Suas finanças, em uma visão global.</h1>
        <p>
          {sent
            ? "Enviamos um código de acesso para seu e-mail."
            : "Entre usando seu e-mail. Você receberá um código de acesso."}
        </p>
        <form onSubmit={submit}>
          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            disabled={sent}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="voce@exemplo.com"
          />
          {sent && (
            <>
              <label htmlFor="code">Código de acesso</label>
              <input
                id="code"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                required
                value={code}
                onChange={(event) => setCode(event.target.value)}
                placeholder="000000"
              />
            </>
          )}
          <button className="button" disabled={loading}>
            {loading ? "Aguarde..." : sent ? "Entrar →" : "Enviar código →"}
          </button>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
        </form>
        <small>Sem senha. Código válido por 10 minutos.</small>
      </section>
    </main>
  );
}
