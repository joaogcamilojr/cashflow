import Link from "next/link";

import { Icon } from "@/components/ui/icon";
import { NavigationItem } from "@/lib/navigation/navigation";

export function SidebarNavItem({
  item,
  pathname,
  collapsed,
  onNavigate,
}: {
  item: NavigationItem;
  pathname: string;
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const active = item.isActive?.(pathname) ?? pathname === item.href;
  return (
    <Link
      className={`sidebar-nav-item ${active ? "active" : ""}`}
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      title={collapsed ? item.label : undefined}
    >
      <Icon name={item.icon} />
      <span>{item.label}</span>
    </Link>
  );
}
