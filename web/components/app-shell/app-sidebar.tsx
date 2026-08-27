"use client";

import { AppLogo } from "@/components/ui/app-logo";
import { Icon } from "@/components/ui/icon";
import { navigationGroups } from "@/lib/navigation/navigation";
import { SidebarNavItem } from "./sidebar-nav-item";
import { UserMenu } from "./user-menu";

export function AppSidebar({
  pathname,
  collapsed,
  onToggle,
  name,
  email,
}: {
  pathname: string;
  collapsed: boolean;
  onToggle: () => void;
  name?: string | null;
  email: string;
}) {
  return (
    <aside
      className={`app-sidebar ${collapsed ? "is-collapsed" : ""}`}
      aria-label="Navegação principal"
    >
      <div className="sidebar-top">
        <AppLogo collapsed={collapsed} />
        <button
          className="sidebar-toggle"
          onClick={onToggle}
          aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
          aria-expanded={!collapsed}
        >
          <Icon name={collapsed ? "expand" : "collapse"} />
        </button>
      </div>
      <nav className="sidebar-navigation" aria-label="Seções do aplicativo">
        {navigationGroups.map((group) => (
          <div className="navigation-group" key={group.label}>
            <span className="navigation-group-label">{group.label}</span>
            {group.items.map((item) => (
              <SidebarNavItem
                key={item.href}
                item={item}
                pathname={pathname}
                collapsed={collapsed}
              />
            ))}
          </div>
        ))}
      </nav>
      <div className="sidebar-account">
        <UserMenu name={name} email={email} collapsed={collapsed} />
      </div>
    </aside>
  );
}
