"use client";

import { useRouter } from "next/navigation";
import { AssistantView } from "@/components/planner/assistant-view";
import { usePlannerLayout } from "@/components/planner/planner-layout";

export default function AssistantPage() {
  const router = useRouter();
  const { project, updateProject, setProjectTab } = usePlannerLayout();
  return (
    <AssistantView
      project={project}
      onApply={(nextProject) => {
        updateProject(nextProject);
        setProjectTab("tasks");
        router.push("/project");
      }}
    />
  );
}
