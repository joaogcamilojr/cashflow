export type IconName =
  | "dashboard"
  | "accounts"
  | "plus"
  | "menu"
  | "close"
  | "collapse"
  | "expand"
  | "user"
  | "logout"
  | "back"
  | "chevron"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "refresh";

export type NavigationItem = {
  label: string;
  href: string;
  icon: IconName;
  isActive?: (pathname: string) => boolean;
};

export const navigationGroups = [
  {
    label: "Visão geral",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: "dashboard" as IconName,
        isActive: (pathname: string) => pathname === "/dashboard",
      },
    ],
  },
  {
    label: "Finanças",
    items: [
      {
        label: "Contas e cartões",
        href: "/accounts",
        icon: "accounts" as IconName,
        isActive: (pathname: string) => pathname.startsWith("/accounts"),
      },
    ],
  },
];

export function getBreadcrumbs(pathname: string) {
  const crumbs = [{ label: "Dashboard", href: "/dashboard" }];
  if (pathname.startsWith("/accounts")) {
    crumbs.push({ label: "Contas e cartões", href: "/accounts" });
    if (pathname.includes("/new"))
      crumbs.push({ label: "Nova conta", href: "/accounts/new" });
    else if (pathname.includes("/edit"))
      crumbs.push(
        { label: "Conta", href: pathname.split("/edit")[0] },
        { label: "Editar", href: pathname },
      );
    else if (pathname.split("/").filter(Boolean).length >= 2)
      crumbs.push({ label: "Conta", href: pathname });
  }
  return crumbs;
}
