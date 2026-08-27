"use client";

import Link from "next/link";

import { Icon } from "@/components/ui/icon";
import { Breadcrumbs } from "./breadcrumbs";
import { UserMenu } from "./user-menu";

export function AppHeader({
  pathname,
  name,
  email,
  onMenu,
}: {
  pathname: string;
  name?: string | null;
  email: string;
  onMenu: () => void;
}) {
  const title =
    pathname === "/dashboard"
      ? "Visão geral"
      : pathname.startsWith("/accounts")
        ? "Contas e cartões"
        : "Cash Flow | Global";
  return (
    <header className="app-header">
      <button
        className="mobile-menu-button"
        onClick={onMenu}
        aria-label="Abrir menu"
        aria-controls="mobile-sidebar"
      >
        <Icon name="menu" />
      </button>
      <div className="header-context">
        <Breadcrumbs pathname={pathname} />
        <span className="mobile-header-title">{title}</span>
      </div>
      <div className="header-actions">
        {pathname === "/accounts" && (
          <Link className="button button-small" href="/accounts/new">
            <Icon name="plus" size={17} /> Nova conta
          </Link>
        )}
        <UserMenu name={name} email={email} />
      </div>
    </header>
  );
}
