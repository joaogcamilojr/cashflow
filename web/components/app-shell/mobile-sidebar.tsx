"use client";

import { useEffect, useRef } from "react";

import { AppLogo } from "@/components/ui/app-logo";
import { Icon } from "@/components/ui/icon";
import { navigationGroups } from "@/lib/navigation/navigation";
import { SidebarNavItem } from "./sidebar-nav-item";
import { UserMenu } from "./user-menu";

export function MobileSidebar({
  open,
  pathname,
  onClose,
  name,
  email,
}: {
  open: boolean;
  pathname: string;
  onClose: () => void;
  name?: string | null;
  email: string;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const escape = (event: KeyboardEvent) =>
      event.key === "Escape" && onClose();
    document.addEventListener("keydown", escape);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", escape);
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="mobile-sidebar-layer">
      <div className="mobile-sidebar-overlay" onClick={onClose} />
      <aside
        id="mobile-sidebar"
        className="mobile-sidebar"
        aria-label="Navegação móvel"
      >
        <div className="mobile-sidebar-head">
          <AppLogo />
          <button ref={closeRef} onClick={onClose} aria-label="Fechar menu">
            <Icon name="close" />
          </button>
        </div>
        <nav aria-label="Seções do aplicativo">
          {navigationGroups.map((group) => (
            <div className="navigation-group" key={group.label}>
              <span className="navigation-group-label">{group.label}</span>
              {group.items.map((item) => (
                <SidebarNavItem
                  key={item.href}
                  item={item}
                  pathname={pathname}
                  onNavigate={onClose}
                />
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-account">
          <UserMenu name={name} email={email} />
        </div>
      </aside>
    </div>
  );
}
