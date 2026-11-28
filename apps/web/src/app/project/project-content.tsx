"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProjectView } from "@/components/planner/project/project-view";
import { usePlannerLayout } from "@/components/planner/planner-layout";

export function ProjectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    project,
    projects,
    user,
    projectTab,
    selectProject,
    setProjectTab,
    addTask,
    addPhase,
    toggleTask,
    updateProject,
    removeProject,
    updatePhase,
    reorderPhases,
    removePhase,
    updateTaskDetails,
    removeTask,
    addTaskDependency,
    removeTaskDependency,
  } = usePlannerLayout();
  const projectId = searchParams.get("id");

  useEffect(() => {
    if (projectId) {
      selectProject(projectId);
    }
  }, [projectId, selectProject]);

  return (
    <ProjectView
      project={project}
      projects={projects}
      currentUser={user}
      tab={projectTab}
      onTabChange={setProjectTab}
      onAddTask={addTask}
      onToggleTask={toggleTask}
      onAddPhase={addPhase}
      onUpdateProject={updateProject}
      onDeleteProject={async () => {
        await removeProject();
        router.push("/");
      }}
      onUpdatePhase={updatePhase}
      onReorderPhases={reorderPhases}
      onDeletePhase={removePhase}
      onUpdateTask={updateTaskDetails}
      onDeleteTask={removeTask}
      onAddDependency={addTaskDependency}
      onRemoveDependency={removeTaskDependency}
      onAssistant={() => {
        router.push("/assistant");
      }}
    />
  );
}
