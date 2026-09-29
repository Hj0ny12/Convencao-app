"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/agenda", label: "Agenda" },
  { href: "/questions", label: "Perguntas" },
  { href: "/words", label: "1 Palavra" },
  { href: "/after", label: "After" },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 mx-auto w-full max-w-[480px] border-t border-border bg-background pb-[env(safe-area-inset-bottom)]">
      <ul className="grid grid-cols-4">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-11 items-center justify-center px-1 text-center text-xs underline-offset-4 ${
                  active ? "font-semibold underline" : "font-medium"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
