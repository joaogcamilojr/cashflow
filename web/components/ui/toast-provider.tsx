"use client";

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { ToastViewport } from "./toast-viewport";

type Variant = "success" | "error" | "warning" | "info";
export type ToastInput = {
  variant: Variant;
  title: string;
  description?: string;
  duration?: number;
};
type Toast = ToastInput & { id: number };
const ToastContext = createContext<{ toast: (input: ToastInput) => void }>({
  toast: () => undefined,
});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const dismiss = useCallback(
    (id: number) =>
      setItems((current) => current.filter((item) => item.id !== id)),
    [],
  );
  const toast = useCallback(
    (input: ToastInput) => {
      const id = Date.now() + Math.random();
      setItems((current) => [...current, { ...input, id }].slice(-3));
      if (input.duration !== 0)
        window.setTimeout(
          () => dismiss(id),
          input.duration || (input.variant === "error" ? 0 : 5000),
        );
    },
    [dismiss],
  );
  const value = useMemo(() => ({ toast }), [toast]);
  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport items={items} dismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
