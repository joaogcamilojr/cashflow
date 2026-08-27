import { ReactNode } from "react";

export function PageContainer({
  size = "default",
  children,
  id = "main-content",
}: {
  size?: "default" | "wide" | "form";
  children: ReactNode;
  id?: string;
}) {
  return (
    <main id={id} className={`page-container page-container-${size}`}>
      {children}
    </main>
  );
}
