"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { AuthGate } from "@/components/auth/auth-gate";
import { PlannerLayout } from "@/components/planner/planner-layout";

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/login") return children;

  return (
    <AuthGate>
      <PlannerLayout>{children}</PlannerLayout>
    </AuthGate>
  );
}
