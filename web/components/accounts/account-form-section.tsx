import { ReactNode } from "react";

export function AccountFormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="form-section">
      <h2>{title}</h2>
      {description && <p className="section-help">{description}</p>}
      {children}
    </section>
  );
}
