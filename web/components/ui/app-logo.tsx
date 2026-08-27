import Link from "next/link";

export function AppLogo({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <Link
      className="app-logo"
      href="/dashboard"
      aria-label="Cash Flow Global — Dashboard"
    >
      <span className="mark" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </span>
      {!collapsed && (
        <>
          <span>Cash Flow</span>
          <b>Global</b>
        </>
      )}
    </Link>
  );
}
