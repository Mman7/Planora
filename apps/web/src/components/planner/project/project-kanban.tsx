"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, CalendarDays, GripVertical, Plus } from "lucide-react";
import { isTaskBlocked, Priority, TaskStatus } from "@repo/shared";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Kanban,
  KanbanBoard,
  KanbanColumn,
  KanbanColumnContent,
  KanbanItem,
  KanbanItemHandle,
  KanbanOverlay,
} from "@/components/reui/kanban";
import type { CurrentUser } from "@/lib/auth";
import type { Project, Task, UpdateTaskPayload } from "@/lib/planner-types";
import { cn, priorityLabels, statusClasses } from "../view-common";

const columns = [
  { value: TaskStatus.Todo, label: "To do", accent: "border-t-[#a9acb8]" },
  { value: TaskStatus.InProgress, label: "In progress", accent: "border-t-[#6483b2]" },
  { value: TaskStatus.InReview, label: "In review", accent: "border-t-[#7663c8]" },
  { value: TaskStatus.Completed, label: "Completed", accent: "border-t-[#568568]" },
  { value: TaskStatus.Cancelled, label: "Cancelled", accent: "border-t-[#9b9cad]" },
] as const;

type KanbanColumns = Record<string, Task[]>;

type FilterState = {
  search: string;
  priority: Priority | "ALL";
  phaseId: string;
};

const noop = () => undefined;

function isPriority(value: string): value is Priority {
  const priorities: string[] = [Priority.Low, Priority.Medium, Priority.High, Priority.Urgent];
  return priorities.includes(value);
}

function getColumns(tasks: Task[], filters: FilterState): KanbanColumns {
  const filtered = tasks.filter((task) => {
    const matchesSearch = task.name.toLowerCase().includes(filters.search.toLowerCase());
    const matchesPriority = filters.priority === "ALL" || task.priority === filters.priority;
    const matchesPhase =
      filters.phaseId === "ALL" ||
      (filters.phaseId === "UNASSIGNED" ? task.phaseId === null : task.phaseId === filters.phaseId);
    return matchesSearch && matchesPriority && matchesPhase;
  });

  return Object.fromEntries(
    columns.map((column) => [
      column.value,
      filtered
        .filter((task) => task.status === column.value)
        .sort((left, right) => left.position - right.position),
    ]),
  );
}

async function commitKanbanMove(
  nextBoard: KanbanColumns,
  previousBoard: KanbanColumns,
  onUpdateTask: (task: Task, input: UpdateTaskPayload) => Promise<void>,
  onRollback: (board: KanbanColumns) => void,
) {
  const previousTasks = Object.values(previousBoard).flat();
  const previousById = new Map(previousTasks.map((task) => [task.id, task]));
  const updates = columns.flatMap((column) =>
    nextBoard[column.value].flatMap((task, position) => {
      const previous = previousById.get(task.id);
      if (!previous || (previous.status === column.value && previous.position === position)) {
        return [];
      }
      return [{ task: previous, input: { status: column.value, position } }];
    }),
  );

  try {
    await Promise.all(updates.map(({ task, input }) => onUpdateTask(task, input)));
  } catch (error) {
    onRollback(previousBoard);
    toast.error(error instanceof Error ? error.message : "Unable to save task movement");
  }
}

export function ProjectKanban({
  project,
  tasks,
  currentUser,
  onSelectTask,
  onAddTask,
  onUpdateTask,
}: {
  project: Project;
  tasks: Task[];
  currentUser: CurrentUser | null;
  onSelectTask: (task: Task) => void;
  onAddTask: (status: TaskStatus) => void;
  onUpdateTask: (task: Task, input: UpdateTaskPayload) => Promise<void>;
}) {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    priority: "ALL",
    phaseId: "ALL",
  });
  const derivedColumns = useMemo(() => getColumns(tasks, filters), [tasks, filters]);
  const [board, setBoard] = useState<KanbanColumns>(derivedColumns);

  return (
    <section className="space-y-4" aria-label={`${project.name} task board`}>
      <KanbanToolbar
        filters={filters}
        phases={project.phases}
        onChange={(next) => {
          setFilters(next);
          setBoard(getColumns(tasks, next));
        }}
      />
      <Kanban
        value={board}
        onValueChange={setBoard}
        getItemValue={(task) => task.id}
        restoreOnCancel
        onValueCommit={(nextBoard, meta) => {
          void commitKanbanMove(nextBoard, meta.previousValue, onUpdateTask, setBoard);
        }}
        className="overflow-x-auto pb-2"
      >
        <KanbanBoard className="min-w-295 grid-cols-5 items-start gap-3">
          {columns.map((column) => (
            <KanbanColumn
              key={column.value}
              value={column.value}
              className={cn(
                "min-h-112 rounded-lg border border-[#e2e4ec] border-t-2 bg-[#f7f8fb] p-3",
                column.accent,
              )}
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-semibold text-[#25263a]">{column.label}</h2>
                  <p className="text-xs text-[#8b8c9d]">{board[column.value].length} tasks</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-[#77788a]"
                  title={`Add task to ${column.label}`}
                  aria-label={`Add task to ${column.label}`}
                  onClick={() => {
                    onAddTask(column.value);
                  }}
                >
                  <Plus size={16} />
                </Button>
              </div>
              <KanbanColumnContent value={column.value} className="min-h-40">
                {board[column.value].map((task) => (
                  <KanbanTaskCard
                    key={task.id}
                    task={task}
                    project={project}
                    allTasks={tasks}
                    currentUser={currentUser}
                    onSelect={onSelectTask}
                  />
                ))}
                {board[column.value].length === 0 && (
                  <p className="rounded-md border border-dashed border-[#d9dbe5] px-3 py-5 text-center text-xs text-[#8b8c9d]">
                    No matching tasks
                  </p>
                )}
              </KanbanColumnContent>
            </KanbanColumn>
          ))}
        </KanbanBoard>
        <KanbanOverlay>
          {({ value }) => {
            const task = tasks.find((item) => item.id === value);
            return task ? (
              <KanbanTaskCard
                task={task}
                project={project}
                allTasks={tasks}
                currentUser={currentUser}
                onSelect={noop}
              />
            ) : null;
          }}
        </KanbanOverlay>
      </Kanban>
    </section>
  );
}

function KanbanToolbar({
  filters,
  phases,
  onChange,
}: {
  filters: FilterState;
  phases: Project["phases"];
  onChange: (filters: FilterState) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-[#e2e4ec] bg-white p-3">
      <input
        value={filters.search}
        onChange={(event) => {
          onChange({ ...filters, search: event.target.value });
        }}
        placeholder="Search tasks"
        aria-label="Search tasks"
        className="h-9 min-w-52 flex-1 rounded-md border border-[#e2e4ec] bg-[#fbfbfd] px-3 text-sm outline-none focus:border-[#7663c8] focus:ring-2 focus:ring-[#7663c8]/15"
      />
      <select
        value={filters.priority}
        onChange={(event) => {
          const value = event.target.value;
          onChange({ ...filters, priority: value === "ALL" || !isPriority(value) ? "ALL" : value });
        }}
        aria-label="Filter by priority"
        className="h-9 rounded-md border border-[#e2e4ec] bg-white px-2 text-sm text-[#55566b] outline-none focus:border-[#7663c8]"
      >
        <option value="ALL">All priorities</option>
        {([Priority.Low, Priority.Medium, Priority.High, Priority.Urgent] as Priority[]).map(
          (priority) => (
            <option key={priority} value={priority}>
              {priorityLabels[priority]}
            </option>
          ),
        )}
      </select>
      <select
        value={filters.phaseId}
        onChange={(event) => {
          onChange({ ...filters, phaseId: event.target.value });
        }}
        aria-label="Filter by phase"
        className="h-9 rounded-md border border-[#e2e4ec] bg-white px-2 text-sm text-[#55566b] outline-none focus:border-[#7663c8]"
      >
        <option value="ALL">All phases</option>
        <option value="UNASSIGNED">Unassigned</option>
        {phases.map((phase) => (
          <option key={phase.id} value={phase.id}>
            {phase.name}
          </option>
        ))}
      </select>
    </div>
  );
}

function KanbanTaskCard({
  task,
  project,
  allTasks,
  currentUser,
  onSelect,
}: {
  task: Task;
  project: Project;
  allTasks: Task[];
  currentUser: CurrentUser | null;
  onSelect: (task: Task) => void;
}) {
  const phaseName = project.phases.find((phase) => phase.id === task.phaseId)?.name;
  const overdue = Boolean(
    task.dueDate &&
    task.dueDate < new Date().toISOString().slice(0, 10) &&
    task.status !== TaskStatus.Completed,
  );
  const blocked = isTaskBlocked(task, project.dependencies, allTasks);

  return (
    <KanbanItem value={task.id}>
      <article
        className={cn(
          "group rounded-md border border-[#e2e4ec] bg-white p-3 shadow-sm outline-none transition hover:border-[#c9c1ef] hover:shadow-md focus-within:ring-2 focus-within:ring-[#7663c8]/25",
          task.status === TaskStatus.Completed && "opacity-75",
          task.status === TaskStatus.Cancelled && "opacity-60",
        )}
        tabIndex={0}
        role="button"
        onClick={() => {
          onSelect(task);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onSelect(task);
          }
        }}
      >
        <div className="flex items-start gap-2">
          <KanbanItemHandle
            className="mt-0.5 shrink-0 rounded p-1 text-[#a2a3b2] hover:bg-[#f1effb] hover:text-[#7663c8]"
            aria-label={`Drag ${task.name}`}
          >
            <GripVertical size={15} />
          </KanbanItemHandle>
          <h3
            className={cn(
              "min-w-0 flex-1 text-sm font-medium leading-5 text-[#25263a]",
              task.status === TaskStatus.Completed && "line-through",
            )}
          >
            {task.name}
          </h3>
        </div>
        <TaskCardBadges task={task} blocked={blocked} />
        <TaskCardSchedule
          phaseName={phaseName}
          dueDate={task.dueDate}
          overdue={overdue}
          assignee={task.assignee}
          currentUser={currentUser}
        />
      </article>
    </KanbanItem>
  );
}

function TaskCardBadges({ task, blocked }: { task: Task; blocked: boolean }) {
  return (
    <div className="mt-3 flex flex-wrap gap-1.5">
      <Badge className={statusClasses[task.priority]}>{priorityLabels[task.priority]}</Badge>
      {blocked && (
        <Badge className="bg-[#fbf2df] text-[#a7803d]">
          <AlertTriangle size={12} /> Blocked
        </Badge>
      )}
    </div>
  );
}

function TaskCardSchedule({
  phaseName,
  dueDate,
  overdue,
  assignee,
  currentUser,
}: {
  phaseName?: string;
  dueDate: string | null;
  overdue: boolean;
  assignee: string;
  currentUser: CurrentUser | null;
}) {
  return (
    <div className="mt-3 space-y-1 text-xs text-[#77788a]">
      {phaseName && <p>Phase: {phaseName}</p>}
      {dueDate && (
        <p className={cn("flex items-center gap-1", overdue && "font-medium text-[#b16b52]")}>
          <CalendarDays size={13} /> {overdue ? "Overdue" : "Due"} {dueDate}
        </p>
      )}
      {assignee && assignee !== currentUser?.name && (
        <p className="truncate">Assigned to {assignee}</p>
      )}
    </div>
  );
}
