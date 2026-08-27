"use client";

import { useState } from "react";

import { Icon } from "@/components/ui/icon";
import { useToast } from "@/components/ui/toast-provider";

export function UserMenu({
  name,
  email,
  collapsed = false,
}: {
  name?: string | null;
  email: string;
  collapsed?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();
  const display = name || email;
  const initials = (name || email)
    .split(/[\s@]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  async function logout() {
    setBusy(true);
    try {
      const response = await fetch("/api/v1/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error();
      window.location.href = "/login";
    } catch {
      setBusy(false);
      toast({
        variant: "error",
        title: "Não foi possível sair",
        description: "Tente novamente.",
      });
    }
  }
  return (
    <div className="user-menu">
      <button
        className="user-trigger"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        title={collapsed ? display : undefined}
      >
        <span className="avatar">{initials}</span>
        {!collapsed && (
          <span className="user-summary">
            <b>{display}</b>
            <small>{email}</small>
          </span>
        )}
        <Icon name="chevron" size={16} />
      </button>
      {open && (
        <div className="user-popover">
          <strong>{display}</strong>
          <small>{email}</small>
          <button onClick={logout} disabled={busy}>
            <Icon name="logout" size={17} />
            {busy ? "Saindo..." : "Sair"}
          </button>
        </div>
      )}
    </div>
  );
}
