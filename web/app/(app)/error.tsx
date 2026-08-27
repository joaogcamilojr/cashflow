"use client";

import Link from "next/link";

import { ErrorState } from "@/components/ui/error-state";

export default function AppError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="boundary-page">
      <ErrorState
        title="Algo deu errado"
        description="Não foi possível concluir esta página."
        retry={reset}
        action={
          <Link className="button button-small secondary" href="/dashboard">
            Ir para dashboard
          </Link>
        }
      />
    </div>
  );
}
