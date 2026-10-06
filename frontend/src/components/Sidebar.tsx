"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Learn", icon: "🏠" },
  { href: "/leaderboard", label: "Leaderboards", icon: "🛡️" },
  { href: "/profile", label: "Profile", icon: "👤" },
  { href: "/settings", label: "More", icon: "⋯" },
];

export function Sidebar() {
  const pathname = usePathname();
  const onLesson = pathname.startsWith("/lesson");

  if (onLesson) return null;

  return (
    <>
      <aside className="hidden w-64 flex-col border-r-2 border-duo-gray bg-white md:flex">
        <div className="flex items-center gap-2 px-6 py-5">
          <span className="text-3xl font-black text-duo-green">duo</span>
          <span className="text-3xl font-light text-duo-feather">lingo</span>
        </div>
        <nav className="flex flex-col gap-1 px-3">
          {links.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-wide ${
                  active
                    ? "bg-duo-blue/15 text-duo-blue"
                    : "text-duo-feather hover:bg-gray-50"
                }`}
              >
                <span>{link.icon}</span>
                {link.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t-2 border-duo-gray bg-white md:hidden">
        {links.slice(0, 4).map((link) => {
          const active =
            link.href === "/"
              ? pathname === "/"
              : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-1 flex-col items-center py-2 text-xs font-bold ${
                active ? "text-duo-blue" : "text-duo-feather"
              }`}
            >
              <span className="text-xl">{link.icon}</span>
              {link.label.split(" ")[0]}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
