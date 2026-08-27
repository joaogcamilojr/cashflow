import Link from "next/link";

export default function AccountNotFound() {
  return (
    <div className="boundary-page">
      <div className="empty-state">
        <span className="state-icon">404</span>
        <h2>Conta não encontrada</h2>
        <p>A conta não existe ou não está disponível para você.</p>
        <Link className="button button-small" href="/accounts">
          Voltar para contas
        </Link>
      </div>
    </div>
  );
}
