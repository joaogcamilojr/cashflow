import Link from "next/link";

export default function NotFound() {
  return (
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
      <h1>Página não encontrada</h1>
      <p>O endereço não existe ou não está disponível.</p>
      <Link className="button" href="/dashboard">
        Ir para dashboard
      </Link>
    </div>
  );
}
