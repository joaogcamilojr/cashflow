import { ReactNode } from "react";

import { IconName } from "@/lib/navigation/navigation";
import { Icon } from "./icon";

export function EmptyState({
  title,
  description,
  icon = "info",
  action,
  secondaryAction,
}: {
  title: string;
  description: string;
  icon?: IconName;
  action?: ReactNode;
  secondaryAction?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <span className="state-icon">
        <Icon name={icon} />
      </span>
      <h2>{title}</h2>
      <p>{description}</p>
      <div className="state-actions">
        {action}
        {secondaryAction}
      </div>
    </div>
  );
}
