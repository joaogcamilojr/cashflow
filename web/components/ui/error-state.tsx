import { ReactNode } from "react";

import { Icon } from "./icon";

export function ErrorState({
  title = "Não foi possível carregar",
  description = "Tente novamente em instantes.",
  retry,
  action,
  compact = false,
}: {
  title?: string;
  description?: string;
  retry?: () => void;
  action?: ReactNode;
  compact?: boolean;
}) {
  return (
    <div className={`error-state ${compact ? "compact" : ""}`} role="alert">
      <span className="state-icon danger">
        <Icon name="error" />
      </span>
      <h2>{title}</h2>
      <p>{description}</p>
      <div className="state-actions">
        {retry && (
          <button className="button button-small" onClick={retry}>
            <Icon name="refresh" size={16} /> Tentar novamente
          </button>
        )}
        {action}
      </div>
    </div>
  );
}
