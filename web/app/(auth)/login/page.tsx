import { Suspense } from "react";

import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="auth-shell">
          <section className="auth-card">
            <p>Carregando acesso...</p>
          </section>
        </main>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
