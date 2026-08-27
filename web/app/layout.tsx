import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Cash Flow | Global",
  description:
    "Controle financeiro multimoeda para viajantes, nômades e uma vida global. Um produto Apgees.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
