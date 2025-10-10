import { usePathname } from "next/navigation";
import { useMemo } from "react";

export default function useActivePage() {
  const pathname = usePathname();

  const paths = useMemo(() => pathname.split("/").filter(Boolean), [pathname]);

  const activePage = useMemo(() => paths[paths.length - 1], [paths]);

  const isActive = (key) => {
    return pathname === key;
  };

  const route = (key) =>
    key === activePage ? `/${activePage}` : `/${activePage}/${key}`;

  return { activePage, pathname, paths, isActive, route };
}
