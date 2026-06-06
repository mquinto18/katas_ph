"use client";

import { usePathname } from "next/navigation";
import SideNav from "./SideNav";
import TopNav from "./TopNav";
import type { User } from "@supabase/supabase-js";

interface AppShellProps {
  children: React.ReactNode;
  user: User | null;
}

export default function AppShell({ children, user }: AppShellProps) {
  const pathname = usePathname();

  if (pathname === "/login") {
    return <>{children}</>;
  }

  return (
    <div style={{ display: "flex", flex: 1, overflow: "hidden", minHeight: 0 }}>
      <SideNav />
      <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden", minHeight: 0 }}>
        <TopNav user={user} />
        <div
          style={{ flex: 1, overflow: "hidden", minHeight: 0, display: "flex", flexDirection: "column" }}
          className="pb-safe"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
