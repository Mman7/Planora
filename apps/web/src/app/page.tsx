"use client";

import { useRouter } from "next/navigation";
import { DashboardView } from "@/components/planner/dashboard-view";

export default function DashboardPage() {
  const router = useRouter();
  return (
    <DashboardView
      onCreate={() => {
        router.push("/create");
      }}
      onProject={(id) => {
        router.push(`/project?id=${encodeURIComponent(id)}`);
      }}
    />
  );
}
