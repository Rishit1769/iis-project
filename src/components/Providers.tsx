"use client";

import { SessionProvider } from "next-auth/react";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider
      baseUrl={typeof window !== "undefined" ? window.location.origin : ""}
    >
      {children}
    </SessionProvider>
  );
}
