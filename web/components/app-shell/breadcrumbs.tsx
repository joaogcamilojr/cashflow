import Link from "next/link";

import { getBreadcrumbs } from "@/lib/navigation/navigation";

export function Breadcrumbs({ pathname }: { pathname: string }) {
  const items = getBreadcrumbs(pathname);
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ol>
        {items.map((item, index) => (
          <li key={`${item.href}-${index}`}>
            {index === items.length - 1 ? (
              <span aria-current="page">{item.label}</span>
            ) : (
              <>
                <Link href={item.href}>{item.label}</Link>
                <span className="breadcrumb-separator" aria-hidden="true">
                  /
                </span>
              </>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
