"use client";

import { useRouter } from "next/navigation";
import { DashboardView } from "@/components/planner/dashboard/dashboard-view";
import { usePlannerLayout } from "@/components/planner/planner-layout";

export default function DashboardPage() {
  const router = useRouter();
  const { projects, user, loading } = usePlannerLayout();
  return (
    <DashboardView
      onCreate={() => {
        router.push("/create");
      }}
      onProject={(id) => {
        router.push(`/project?id=${encodeURIComponent(id)}`);
      }}
      projects={projects}
      userName={user?.name ?? "there"}
      loading={loading}
    />
  );
}
