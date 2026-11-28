import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Project, Task, UpdatePhasePayload } from "@/lib/planner-types";
import { phaseColors, SectionTitle } from "../view-common";
import { PhaseGroup, TaskRow } from "./phase-group";

export function TaskContent({
  project,
  allTasks,
  onToggle,
  onSelectTask,
  onDelete,
  onAddTaskInPhase,
  onUpdatePhase,
  onReorderPhases,
  onDeletePhase,
  currentUserId,
}: {
  project: Project;
  allTasks: Task[];
  onToggle: (task: Task) => Promise<void>;
  onSelectTask: (task: Task) => void;
  onDelete: (task: Task) => Promise<void>;
  onAddTaskInPhase: (phaseId: string | null) => void;
  onUpdatePhase: (phaseId: string, input: UpdatePhasePayload) => Promise<void>;
  onReorderPhases: (phaseIds: string[]) => Promise<void>;
  onDeletePhase: (phaseId: string) => Promise<void>;
  currentUserId?: string;
}) {
  const [draggedPhaseId, setDraggedPhaseId] = useState<string | null>(null);
  const [dragOverPhaseId, setDragOverPhaseId] = useState<string | null>(null);
  const draggedPhase = project.phases.find((phase) => phase.id === draggedPhaseId);

  const movePhase = (phaseId: string, direction: -1 | 1) => {
    const index = project.phases.findIndex((item) => item.id === phaseId);
    const targetIndex = index + direction;
    if (index < 0 || targetIndex < 0 || targetIndex >= project.phases.length) return;
    const ids = project.phases.map((item) => item.id);
    const [moved] = ids.splice(index, 1);
    if (!moved) return;
    ids.splice(targetIndex, 0, moved);
    void onReorderPhases(ids);
  };

  const dropOnPhase = (targetPhaseId: string) => {
    if (!draggedPhaseId || draggedPhaseId === targetPhaseId) {
      setDragOverPhaseId(null);
      return;
    }
    const ids = project.phases.map((item) => item.id);
    const fromIdx = ids.indexOf(draggedPhaseId);
    const toIdx = ids.indexOf(targetPhaseId);
    if (fromIdx < 0 || toIdx < 0) return;
    const [moved] = ids.splice(fromIdx, 1);
    if (!moved) return;
    ids.splice(toIdx, 0, moved);
    setDraggedPhaseId(null);
    setDragOverPhaseId(null);
    void onReorderPhases(ids);
  };

  return (
    <div className="space-y-6">
      {project.phases.map((phase, index) => (
        <PhaseGroup
          key={phase.id}
          phase={phase}
          project={project}
          allTasks={allTasks}
          isFirst={index === 0}
          isLast={index === project.phases.length - 1}
          onDragStart={() => {
            setDraggedPhaseId(phase.id);
            setDragOverPhaseId(null);
          }}
          onDragOver={() => {
            if (draggedPhaseId !== phase.id) {
              setDragOverPhaseId(phase.id);
            }
          }}
          onDragEnd={() => {
            setDraggedPhaseId(null);
            setDragOverPhaseId(null);
          }}
          onDrop={() => {
            dropOnPhase(phase.id);
          }}
          onMoveUp={() => {
            movePhase(phase.id, -1);
          }}
          onMoveDown={() => {
            movePhase(phase.id, 1);
          }}
          onAddTask={() => {
            onAddTaskInPhase(phase.id);
          }}
          onToggle={onToggle}
          onSelectTask={onSelectTask}
          onDelete={onDelete}
          onUpdatePhase={onUpdatePhase}
          onDeletePhase={onDeletePhase}
          currentUserId={currentUserId}
          showDropPlaceholder={dragOverPhaseId === phase.id && draggedPhaseId !== phase.id}
          dropPlaceholderPhase={draggedPhase}
        />
      ))}
      <UnassignedTasksSection
        tasks={project.unassignedTasks}
        project={project}
        allTasks={allTasks}
        onAddTask={() => {
          onAddTaskInPhase(null);
        }}
        onToggle={onToggle}
        onSelectTask={onSelectTask}
        onDelete={onDelete}
        currentUserId={currentUserId}
      />
    </div>
  );
}

function UnassignedTasksSection({
  tasks,
  project,
  allTasks,
  onAddTask,
  onToggle,
  onSelectTask,
  onDelete,
  currentUserId,
}: {
  tasks: Task[];
  project: Project;
  allTasks: Task[];
  onAddTask: () => void;
  onToggle: (task: Task) => Promise<void>;
  onSelectTask: (task: Task) => void;
  onDelete: (task: Task) => Promise<void>;
  currentUserId?: string;
}) {
  return (
    <section>
      <div className="flex items-center justify-between">
        <SectionTitle count={`${String(tasks.length)} tasks`}>
          <span
            className="mr-2 inline-block size-2 rounded-full align-middle"
            style={{ backgroundColor: phaseColors.pink }}
          />
          Unassigned Tasks
        </SectionTitle>
        <Button variant="ghost" size="sm" onClick={onAddTask}>
          <Plus size={14} />
          Add task
        </Button>
      </div>
      <div className="overflow-hidden rounded-lg border border-[#e2e4ec] bg-white">
        {tasks.map((task) => (
          <TaskRow
            key={task.id}
            task={task}
            project={project}
            allTasks={allTasks}
            onToggle={onToggle}
            onSelectTask={onSelectTask}
            onDelete={onDelete}
            currentUserId={currentUserId}
          />
        ))}
        {tasks.length === 0 && (
          <p className="px-4 py-3 text-xs text-[#8b8c9d]">
            No unassigned tasks. Tasks without a phase appear here.
          </p>
        )}
      </div>
    </section>
  );
}
