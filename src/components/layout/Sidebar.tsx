"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/create", label: "Create Viva" },
  { href: "/dashboard/vivas", label: "My Vivas" },
  { href: "/dashboard/results", label: "Results" },
  { href: "/dashboard/settings", label: "Settings" },
] as const;

export default function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string; role: string } | null>(
    null
  );

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data?.name) setUser(data);
      })
      .catch(() => {});
  }, []);

  return (
    <aside className="w-64 bg-white border-r border-black min-h-screen flex flex-col">
      <div className="p-6 border-b border-black">
        <h1 className="font-display text-lg font-bold tracking-tight">
          AI Viva Examiner
        </h1>
        <p className="font-mono text-[10px] uppercase tracking-widest mt-1 text-[#525252]">
          Teacher Portal
        </p>
      </div>
      <nav className="flex-1 p-4">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-3 font-mono text-xs uppercase tracking-widest border-l-2 transition-colors duration-100 mb-1 ${
                isActive
                  ? "border-black text-black bg-black/[0.03]"
                  : "border-transparent text-[#525252] hover:text-black hover:border-[#E5E5E5]"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-black">
        <div className="px-3 py-2">
          <p className="font-body text-sm font-medium truncate">
            {user?.name || "Teacher"}
          </p>
          <p className="font-mono text-[10px] uppercase tracking-widest text-[#525252]">
            {user?.role || "TEACHER"}
          </p>
        </div>
      </div>
    </aside>
  );
}
