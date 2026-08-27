/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { ReactNode, useEffect, useState } from "react";

import { ToastProvider } from "@/components/ui/toast-provider";
import { usePathname } from "next/navigation";
import { AppHeader } from "./app-header";
import { AppSidebar } from "./app-sidebar";
import { MobileSidebar } from "./mobile-sidebar";

export function AppShell({
  children,
  email,
  displayName,
}: {
  children: ReactNode;
  email: string;
  displayName?: string | null;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    setCollapsed(
      window.localStorage.getItem("cash-flow-sidebar-collapsed") === "true",
    );
  }, []);
  function toggleCollapsed() {
    setCollapsed((value) => {
      const next = !value;
      window.localStorage.setItem("cash-flow-sidebar-collapsed", String(next));
      return next;
    });
  }
  return (
    <ToastProvider>
      <a className="skip-link" href="#main-content">
        Pular para o conteúdo
      </a>
      <div className="app-layout">
        <AppSidebar
          pathname={pathname}
          collapsed={collapsed}
          onToggle={toggleCollapsed}
          name={displayName}
          email={email}
        />
        <MobileSidebar
          open={mobileOpen}
          pathname={pathname}
          onClose={() => setMobileOpen(false)}
          name={displayName}
          email={email}
        />
        <div className="app-workspace">
          <AppHeader
            pathname={pathname}
            name={displayName}
            email={email}
            onMenu={() => setMobileOpen(true)}
          />
          {children}
        </div>
      </div>
    </ToastProvider>
  );
}
