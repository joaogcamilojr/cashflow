"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <main className="global-boundary">
          <span className="app-logo">
            <span className="mark" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
            </span>
            Cash Flow <b>Global</b>
          </span>
          <h1>Cash Flow | Global</h1>
          <p>O aplicativo encontrou um erro inesperado.</p>
          <button className="button" onClick={reset}>
            Tentar novamente
          </button>
        </main>
      </body>
    </html>
  );
}
