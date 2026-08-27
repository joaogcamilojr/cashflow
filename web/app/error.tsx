"use client";

import Link from "next/link";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <div className="global-boundary">
          <span className="app-logo">
            <span className="mark" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
            </span>
            Cash Flow <b>Global</b>
          </span>
          <h1>Não foi possível carregar</h1>
          <p>Ocorreu um erro inesperado.</p>
          <button className="button" onClick={reset}>
            Tentar novamente
          </button>
          <Link href="/">Voltar ao início</Link>
        </div>
      </body>
    </html>
  );
}
