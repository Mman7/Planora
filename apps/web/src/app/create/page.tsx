"use client";

import { useRouter } from "next/navigation";
import { CreateProjectView } from "@/components/planner/create/create-project-view";
import { usePlannerLayout } from "@/components/planner/planner-layout";

export default function CreatePage() {
  const router = useRouter();
  const { addProject } = usePlannerLayout();
  return (
    <CreateProjectView
      onGenerated={async (name, description) => {
        const id = await addProject(name, description);
        router.push(`/project?id=${encodeURIComponent(id)}`);
      }}
    />
  );
}
