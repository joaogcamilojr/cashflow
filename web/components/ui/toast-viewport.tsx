import { Icon } from "./icon";
import { ToastInput } from "./toast-provider";

type Toast = ToastInput & { id: number };
const icons = {
  success: "success",
  error: "error",
  warning: "warning",
  info: "info",
} as const;

export function ToastViewport({
  items,
  dismiss,
}: {
  items: Toast[];
  dismiss: (id: number) => void;
}) {
  return (
    <div className="toast-viewport" aria-live="polite">
      {items.map((item) => (
        <div
          key={item.id}
          className={`toast toast-${item.variant}`}
          role={item.variant === "error" ? "alert" : "status"}
          tabIndex={0}
        >
          <Icon name={icons[item.variant]} />
          <div>
            <strong>{item.title}</strong>
            {item.description && <p>{item.description}</p>}
          </div>
          <button
            type="button"
            aria-label="Fechar mensagem"
            onClick={() => dismiss(item.id)}
          >
            <Icon name="close" size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
