"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "home" },
  { href: "/dashboard/create", label: "Create Viva", icon: "plus" },
  { href: "/dashboard/vivas", label: "My Vivas", icon: "list" },
  { href: "/dashboard/results", label: "Results", icon: "chart" },
  { href: "/dashboard/settings", label: "Settings", icon: "settings" },
] as const;

const ICONS: Record<string, string> = {
  home: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1",
  plus: "M12 4v16m8-8H4",
  list: "M4 6h16M4 10h16M4 14h16M4 18h16",
  chart: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
  settings: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z",
};

export default function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" });
  };

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data?.name) setUser(data);
      })
      .catch(() => {});
  }, []);

  return (
    <aside className="w-[240px] bg-bg-secondary border-r border-border flex flex-col h-screen fixed left-0 top-0">
      {/* Logo */}
      <div className="px-4 h-14 flex items-center border-b border-border">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-6 h-6 bg-accent rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">V</span>
          </div>
          <span className="font-semibold text-sm">VivaAI</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 text-sm rounded transition-colors duration-150 ${
                isActive
                  ? "bg-bg-hover text-text"
                  : "text-text-secondary hover:text-text hover:bg-bg-hover"
              }`}
            >
              <svg
                className="w-4 h-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d={ICONS[item.icon]}
                />
              </svg>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="mx-3 border-t border-border" />

      {/* User */}
      <div className="px-3 py-3">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-7 h-7 bg-bg-elevated border border-border rounded flex items-center justify-center">
            <span className="text-text-secondary text-xs font-medium">
              {user?.name
                ? user.name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .toUpperCase()
                    .substring(0, 2)
                : "T"}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">
              {user?.name || "Teacher"}
            </p>
            <p className="text-2xs text-text-muted">{user?.role || "TEACHER"}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full mt-2 px-3 py-2 text-left text-sm text-text-secondary hover:text-text hover:bg-bg-hover rounded transition-colors"
        >
          Log out
        </button>
      </div>
    </aside>
  );
}
