import { PageSkeleton } from "./skeleton";

export function LoadingState({
  label = "Carregando conteúdo",
}: {
  label?: string;
}) {
  return (
    <div className="loading-state" role="status" aria-label={label}>
      <PageSkeleton />
    </div>
  );
}
