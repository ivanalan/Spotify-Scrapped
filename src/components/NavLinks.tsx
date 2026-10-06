"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home" },
  { href: "/scrapped", label: "Scrapped" },
  { href: "/scrapped/api", label: "API Scrapped" },
  { href: "/scrapped/lab", label: "API Lab" },
] as const;

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  const matches = links
    .map((l) => l.href)
    .filter(
      (h) => h !== "/" && (pathname === h || pathname.startsWith(`${h}/`)),
    )
    .sort((a, b) => b.length - a.length);
  return matches[0] === href;
}

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-5 text-sm">
      {links.map((link) => {
        const active = isActive(pathname, link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "relative pb-0.5 transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out)]",
              active
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {link.label}
            {active ? (
              <span
                aria-hidden
                className="absolute inset-x-0 -bottom-1 h-px bg-ring"
              />
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
