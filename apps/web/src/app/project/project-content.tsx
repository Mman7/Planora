"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProjectView } from "@/components/planner/project-view";
import { usePlannerLayout } from "@/components/planner/planner-layout";

export function ProjectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { project, projectTab, selectProject, setProjectTab, updateProject } = usePlannerLayout();
  const projectId = searchParams.get("id");

  useEffect(() => {
    if (projectId) {
      selectProject(projectId);
    }
  }, [projectId, selectProject]);

  return (
    <ProjectView
      project={project}
      tab={projectTab}
      onTabChange={setProjectTab}
      onUpdate={updateProject}
      onAssistant={() => {
        router.push("/assistant");
      }}
    />
  );
}
