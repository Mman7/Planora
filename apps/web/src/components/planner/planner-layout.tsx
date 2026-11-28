"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  FolderKanban,
  LayoutDashboard,
  ListTodo,
  LogOut,
  Menu,
  Settings as SettingsIcon,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { PhaseStatus, TaskStatus } from "@repo/shared";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { getCurrentUser, signOut, type CurrentUser } from "@/lib/auth";
import {
  addDependency as addDependencyApi,
  createPhase,
  createProject,
  createTask,
  deletePhase,
  deleteProject,
  deleteTask,
  listDependencies,
  listPhases,
  listProjects,
  listTasks,
  recomputeProjectDerivedState,
  removeDependency as removeDependencyApi,
  reorderPhases as reorderPhasesApi,
  toProject,
  toTask,
  updatePhase as updatePhaseApi,
  updateProject as updateProjectApi,
  updateTask as updateTaskApi,
} from "@/lib/api";
import type {
  CreatePhasePayload,
  CreateTaskPayload,
  Project,
  ProjectTab,
  Task,
  UpdatePhasePayload,
  UpdateTaskPayload,
  View,
} from "@/lib/planner-types";

const navItems = [
  { id: "dashboard" as View, label: "Workspace", icon: LayoutDashboard },
  { id: "project" as View, label: "My Projects", icon: FolderKanban },
  { id: "assistant" as View, label: "Inbox", icon: Activity },
  { id: "create" as View, label: "Templates", icon: ListTodo },
  { id: "settings" as View, label: "Settings", icon: SettingsIcon },
];

type PlannerContextValue = {
  projectTab: ProjectTab;
  project: Project;
  user: CurrentUser | null;
  projects: Project[];
  loading: boolean;
  selectProject: (id: string) => void;
  openProject: (id: string, tab?: ProjectTab) => void;
  setProjectTab: (tab: ProjectTab) => void;
  addProject: (name: string, description: string) => Promise<string>;
  addTask: (projectId: string, input: CreateTaskPayload) => Promise<void>;
  addPhase: (input: CreatePhasePayload) => Promise<string>;
  toggleTask: (task: Task) => Promise<void>;
  updateProject: (nameOrProject: string | Project, description?: string) => Promise<void>;
  removeProject: () => Promise<void>;
  updatePhase: (phaseId: string, input: UpdatePhasePayload) => Promise<void>;
  reorderPhases: (phaseIds: string[]) => Promise<void>;
  removePhase: (phaseId: string) => Promise<void>;
  updateTaskDetails: (task: Task, input: UpdateTaskPayload) => Promise<void>;
  removeTask: (task: Task) => Promise<void>;
  addTaskDependency: (taskId: string, dependsOnTaskId: string) => Promise<void>;
  removeTaskDependency: (taskId: string, dependsOnTaskId: string) => Promise<void>;
};
const PlannerContext = createContext<PlannerContextValue | null>(null);

export function usePlannerLayout() {
  const context = useContext(PlannerContext);
  if (!context) throw new Error("usePlannerLayout must be used inside PlannerLayout");
  return context;
}

export function PlannerLayout({ children }: { children: ReactNode }) {
  const [projectTab, setProjectTab] = useState<ProjectTab>("tasks");
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [loading, setLoading] = useState(true);
  const [assistantOpen, setAssistantOpen] = useState(true);
  const [mobileAssistantOpen, setMobileAssistantOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const user = useCurrentUser();
  const pathname = usePathname();
  const router = useRouter();
  const project = projects.find((item) => item.id === selectedProjectId) ?? emptyProject;
  useProjectLoader(setProjects, setSelectedProjectId, setLoading);
  const selectProject = (id: string) => {
    setSelectedProjectId(id);
  };
  const navigate = (nextView: View) => {
    router.push(nextView === "dashboard" ? "/" : `/${nextView}`);
    setMobileNavOpen(false);
  };
  const openProject = (id: string, tab: ProjectTab = "tasks") => {
    setSelectedProjectId(id);
    setProjectTab(tab);
    router.push(`/project?id=${encodeURIComponent(id)}`);
  };
  const actions = {
    ...useProjectActions(project, setProjects, setSelectedProjectId),
    ...usePlanningActions(project, setProjects),
  };
  const value = {
    projectTab,
    project,
    user,
    projects,
    loading,
    selectProject,
    openProject,
    setProjectTab,
    ...actions,
  };
  const activeView = pathname === "/" ? "dashboard" : (pathname.slice(1).split("/")[0] as View);
  return (
    <PlannerContext.Provider value={value}>
      <PlannerFrame
        activeView={activeView}
        project={project}
        user={user}
        navigate={navigate}
        mobileNavOpen={mobileNavOpen}
        setMobileNavOpen={setMobileNavOpen}
        assistantOpen={assistantOpen}
        setAssistantOpen={setAssistantOpen}
        mobileAssistantOpen={mobileAssistantOpen}
        setMobileAssistantOpen={setMobileAssistantOpen}
      >
        {children}
      </PlannerFrame>
    </PlannerContext.Provider>
  );
}

const emptyProject: Project = {
  id: "",
  name: "Projects",
  description: "",
  status: "In progress",
  progress: 0,
  tone: "purple",
  edited: "",
  phases: [],
  unassignedTasks: [],
  dependencies: [],
};

async function fetchAllHydratedProjects(): Promise<Project[]> {
  const { items } = await listProjects();
  return Promise.all(
    items.map(async (item) => {
      const [phases, tasks, deps] = await Promise.all([
        listPhases(item.id),
        listTasks(item.id),
        listDependencies(item.id).catch(() => []),
      ]);
      return toProject(item, phases, tasks, deps);
    }),
  );
}

function useProjectLoader(
  setProjects: Dispatch<SetStateAction<Project[]>>,
  setSelectedProjectId: Dispatch<SetStateAction<string>>,
  setLoading: Dispatch<SetStateAction<boolean>>,
) {
  useEffect(() => {
    let active = true;
    void fetchAllHydratedProjects()
      .then((hydrated) => {
        if (!active) return;
        setProjects(hydrated);
        setSelectedProjectId((current) => current || hydrated[0]?.id || "");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [setLoading, setProjects, setSelectedProjectId]);
}

function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  useEffect(() => {
    void getCurrentUser().then(setUser);
  }, []);
  return user;
}

function useProjectActions(
  project: Project,
  setProjects: Dispatch<SetStateAction<Project[]>>,
  setSelectedProjectId: Dispatch<SetStateAction<string>>,
) {
  const addProject = async (name: string, description: string) => {
    const created = await createProject({ name, description });
    setProjects((current) => [...current, toProject(created)]);
    setSelectedProjectId(created.id);
    return created.id;
  };
  const updateProject = async (nameOrProject: string | Project, description = "") => {
    if (!project.id) return;
    const name = typeof nameOrProject === "string" ? nameOrProject : nameOrProject.name;
    const nextDescription =
      typeof nameOrProject === "string" ? description : nameOrProject.description;
    const updated = await updateProjectApi(project.id, { name, description: nextDescription });
    setProjects((current) =>
      current.map((item) =>
        item.id === project.id
          ? { ...item, name: updated.name, description: updated.description ?? "" }
          : item,
      ),
    );
  };
  const removeProject = async () => {
    if (!project.id) return;
    await deleteProject(project.id);
    setProjects((current) => current.filter((item) => item.id !== project.id));
    setSelectedProjectId("");
  };
  return {
    addProject,
    updateProject,
    removeProject,
  };
}

function usePhaseActions(
  projectId: string,
  updateTargetProject: (projectId: string, updater: (item: Project) => Project) => void,
) {
  const addPhase = async (input: CreatePhasePayload) => {
    if (!projectId) return "";
    const created = await createPhase(projectId, input);
    updateTargetProject(projectId, (item) => ({
      ...item,
      phases: [
        ...item.phases,
        {
          id: created.id,
          projectId,
          name: created.name,
          description: created.description ?? null,
          position: created.position,
          startDate: created.startDate,
          dueDate: created.dueDate ?? created.endDate,
          isOnHold: Boolean(created.isOnHold),
          status: PhaseStatus.NotStarted,
          progress: 0,
          tone: "teal",
          tasks: [],
        },
      ],
    }));
    return created.id;
  };
  const updatePhase = async (phaseId: string, input: UpdatePhasePayload) => {
    if (!projectId) return;
    const updated = await updatePhaseApi(projectId, phaseId, input);
    updateTargetProject(projectId, (item) => ({
      ...item,
      phases: item.phases.map((phase) =>
        phase.id === phaseId
          ? {
              ...phase,
              name: updated.name,
              description: updated.description ?? null,
              startDate: updated.startDate,
              dueDate: updated.dueDate ?? updated.endDate,
              isOnHold: Boolean(updated.isOnHold),
            }
          : phase,
      ),
    }));
  };
  const reorderPhases = async (phaseIds: string[]) => {
    if (!projectId) return;
    const reordered = await reorderPhasesApi(projectId, phaseIds);
    const positionById = new Map(reordered.map((phase) => [phase.id, phase.position]));
    updateTargetProject(projectId, (item) => ({
      ...item,
      phases: [...item.phases]
        .map((phase) => ({ ...phase, position: positionById.get(phase.id) ?? phase.position }))
        .sort((a, b) => a.position - b.position),
    }));
  };
  const removePhase = async (phaseId: string) => {
    if (!projectId) return;
    await deletePhase(projectId, phaseId);
    updateTargetProject(projectId, (item) => removePhaseFromProject(item, phaseId));
  };
  return { addPhase, updatePhase, reorderPhases, removePhase };
}

function usePlanningActions(project: Project, setProjects: Dispatch<SetStateAction<Project[]>>) {
  const updateTargetProject = (projectId: string, updater: (item: Project) => Project) => {
    setProjects((current) =>
      current.map((item) =>
        item.id === projectId ? recomputeProjectDerivedState(updater(item)) : item,
      ),
    );
  };
  const phaseActions = usePhaseActions(project.id, updateTargetProject);
  const addTask = async (projectId: string, input: CreateTaskPayload) => {
    const targetProjectId = projectId || project.id;
    if (!targetProjectId) return;
    const created = await createTask(targetProjectId, input);
    const mapped = toTask(created, targetProjectId);
    updateTargetProject(targetProjectId, (item) => addTaskToProject(item, mapped));
  };
  const toggleTask = async (task: Task) => {
    const targetProjectId = task.projectId || project.id;
    if (!targetProjectId) return;
    const nextStatus =
      task.status === TaskStatus.Completed ? TaskStatus.Todo : TaskStatus.Completed;
    const updated = await updateTaskApi(targetProjectId, task.id, { status: nextStatus });
    updateTargetProject(targetProjectId, (item) =>
      replaceTaskInProject(item, toTask(updated, targetProjectId)),
    );
  };
  const updateTaskDetails = async (task: Task, input: UpdateTaskPayload) => {
    const targetProjectId = task.projectId || project.id;
    if (!targetProjectId) return;
    const updated = await updateTaskApi(targetProjectId, task.id, input);
    updateTargetProject(targetProjectId, (item) =>
      replaceTaskInProject(item, toTask(updated, targetProjectId)),
    );
  };
  const removeTask = async (task: Task) => {
    const targetProjectId = task.projectId || project.id;
    if (!targetProjectId) return;
    await deleteTask(targetProjectId, task.id);
    updateTargetProject(targetProjectId, (item) => removeTaskFromProject(item, task.id));
  };
  const addTaskDependency = async (taskId: string, dependsOnTaskId: string) => {
    if (!project.id) return;
    const created = await addDependencyApi(project.id, taskId, dependsOnTaskId);
    updateTargetProject(project.id, (item) => ({
      ...item,
      dependencies: [
        ...item.dependencies,
        {
          id: created.id,
          taskId: created.taskId,
          dependsOnTaskId: created.dependsOnTaskId,
          createdAt: created.createdAt
            ? new Date(created.createdAt).toISOString()
            : new Date().toISOString(),
        },
      ],
    }));
  };
  const removeTaskDependency = async (taskId: string, dependsOnTaskId: string) => {
    if (!project.id) return;
    await removeDependencyApi(project.id, taskId, dependsOnTaskId);
    updateTargetProject(project.id, (item) => ({
      ...item,
      dependencies: item.dependencies.filter(
        (dep) => !(dep.taskId === taskId && dep.dependsOnTaskId === dependsOnTaskId),
      ),
    }));
  };
  return {
    ...phaseActions,
    addTask,
    toggleTask,
    updateTaskDetails,
    removeTask,
    addTaskDependency,
    removeTaskDependency,
  };
}

function addTaskToProject(project: Project, task: Task): Project {
  if (!task.phaseId) {
    return {
      ...project,
      unassignedTasks: [...project.unassignedTasks, task],
    };
  }
  const hasPhase = project.phases.some((phase) => phase.id === task.phaseId);
  if (!hasPhase) {
    return {
      ...project,
      unassignedTasks: [...project.unassignedTasks, { ...task, phaseId: null }],
    };
  }
  return {
    ...project,
    phases: project.phases.map((phase) =>
      phase.id === task.phaseId ? { ...phase, tasks: [...phase.tasks, task] } : phase,
    ),
  };
}

function replaceTaskInProject(project: Project, updated: Task): Project {
  const withoutOld = {
    ...project,
    phases: project.phases.map((phase) => ({
      ...phase,
      tasks: phase.tasks.filter((task) => task.id !== updated.id),
    })),
    unassignedTasks: project.unassignedTasks.filter((task) => task.id !== updated.id),
  };
  return addTaskToProject(withoutOld, updated);
}

function removePhaseFromProject(project: Project, phaseId: string): Project {
  const removedPhase = project.phases.find((phase) => phase.id === phaseId);
  if (!removedPhase) return project;
  const unassignedFromPhase = removedPhase.tasks.map((task) => ({ ...task, phaseId: null }));
  return {
    ...project,
    phases: project.phases.filter((phase) => phase.id !== phaseId),
    unassignedTasks: [...project.unassignedTasks, ...unassignedFromPhase],
  };
}

function removeTaskFromProject(project: Project, taskId: string): Project {
  return {
    ...project,
    phases: project.phases.map((phase) => ({
      ...phase,
      tasks: phase.tasks.filter((task) => task.id !== taskId),
    })),
    unassignedTasks: project.unassignedTasks.filter((task) => task.id !== taskId),
    dependencies: project.dependencies.filter(
      (dep) => dep.taskId !== taskId && dep.dependsOnTaskId !== taskId,
    ),
  };
}

function PlannerFrame({
  children,
  activeView,
  project,
  user,
  navigate,
  mobileNavOpen,
  setMobileNavOpen,
  assistantOpen,
  setAssistantOpen,
  mobileAssistantOpen,
  setMobileAssistantOpen,
}: {
  children: ReactNode;
  activeView: View;
  project: Project;
  user: CurrentUser | null;
  navigate: (view: View) => void;
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
  assistantOpen: boolean;
  setAssistantOpen: (open: boolean) => void;
  mobileAssistantOpen: boolean;
  setMobileAssistantOpen: (open: boolean) => void;
}) {
  const newLocal = "w-[230px] p-0";
  return (
    <div className="min-h-screen bg-[#f7f8fc] text-[#25243a]">
      <div className="flex min-h-screen">
        <Sidebar activeView={activeView} onNavigate={navigate} user={user} />
        <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
          <SheetContent side="left" className={newLocal}>
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation</SheetTitle>
            </SheetHeader>
            <Sidebar activeView={activeView} onNavigate={navigate} mobile user={user} />
          </SheetContent>
        </Sheet>
        <main className="min-w-0 flex-1">
          <MobileHeader
            onOpenNav={() => {
              setMobileNavOpen(true);
            }}
            onOpenAssistant={() => {
              setMobileAssistantOpen(true);
            }}
          />
          <div className="mx-auto max-w-245 px-4 py-6 md:px-8 md:py-8">{children}</div>
        </main>
        <aside
          className={cn(
            "hidden w-71.5 shrink-0 border-l border-[#e5e7ef] bg-white xl:block",
            !assistantOpen && "w-14",
          )}
        >
          {assistantOpen ? (
            <AssistantPanel
              project={project}
              onClose={() => {
                setAssistantOpen(false);
              }}
              onOpenAssistant={() => {
                navigate("assistant");
              }}
            />
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="m-3"
              onClick={() => {
                setAssistantOpen(true);
              }}
              aria-label="Open assistant"
            >
              <Sparkles />
            </Button>
          )}
        </aside>
        <Sheet open={mobileAssistantOpen} onOpenChange={setMobileAssistantOpen}>
          <SheetContent side="right" className="w-full max-w-90 p-0">
            <AssistantPanel
              project={project}
              onClose={() => {
                setMobileAssistantOpen(false);
              }}
              onOpenAssistant={() => {
                setMobileAssistantOpen(false);
                navigate("assistant");
              }}
            />
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}

function MobileHeader({
  onOpenNav,
  onOpenAssistant,
}: {
  onOpenNav: () => void;
  onOpenAssistant: () => void;
}) {
  return (
    <div className="flex items-center justify-between border-b border-[#e5e7ef] bg-white/70 px-4 py-3 md:hidden">
      <Button variant="ghost" size="icon" onClick={onOpenNav} aria-label="Open navigation">
        <Menu />
      </Button>
      <span className="font-semibold">Planie</span>
      <Button variant="ghost" size="icon" onClick={onOpenAssistant} aria-label="Open assistant">
        <Sparkles />
      </Button>
    </div>
  );
}

function Sidebar({
  activeView,
  onNavigate,
  user,
  mobile = false,
}: {
  activeView: View;
  onNavigate: (view: View) => void;
  user: CurrentUser | null;
  mobile?: boolean;
}) {
  return (
    <aside
      className={cn(
        "flex w-57.5 shrink-0 flex-col border-r border-[#e5e7ef] bg-white px-3 py-5",
        mobile ? "min-h-full" : "hidden md:flex",
      )}
    >
      <button
        className="mb-8 flex items-center gap-2 px-3 text-left"
        onClick={() => {
          onNavigate("dashboard");
        }}
      >
        <span className="grid size-6 place-items-center rounded-md bg-[#f0edfa] text-[#7663c8]">
          <Sparkles size={14} />
        </span>
        <span className="font-semibold tracking-tight">Planie</span>
      </button>
      <nav className="space-y-1">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => {
              onNavigate(id);
            }}
            className={cn(
              "flex h-9 w-full items-center gap-3 rounded-md px-3 text-sm text-[#5f6075] transition-colors hover:bg-[#f5f3fc]",
              activeView === id && "bg-[#f0edfa] font-medium text-[#7663c8]",
            )}
          >
            <Icon size={16} strokeWidth={1.8} />
            {label}
          </button>
        ))}
      </nav>
      <AccountMenu user={user} />
    </aside>
  );
}

function AccountMenu({ user }: { user: CurrentUser | null }) {
  const router = useRouter();
  return (
    <div className="group relative mt-auto border-t border-[#f0f1f5] px-3 pt-5">
      <button
        type="button"
        className="flex w-full items-center gap-3 rounded-md text-left outline-hidden focus-visible:ring-2 focus-visible:ring-[#7663c8]"
        aria-label="Open account menu"
      >
        <Avatar size="default" className="bg-[#e8e2fa] text-xs font-medium text-[#7663c8]">
          <AvatarImage src={user?.image ?? undefined} alt={user?.name ?? "User avatar"} />
          <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium">{user?.name ?? "Loading..."}</p>
          <p className="truncate text-[11px] text-[#858698]">{user?.email ?? ""}</p>
        </div>
      </button>
      <div className="invisible absolute right-3 bottom-full z-50 pb-2 opacity-0 transition-[opacity,transform] group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
        <div className="w-44 translate-y-1 rounded-lg border border-[#e2e4ec] bg-white p-1 shadow-lg transition-transform group-hover:translate-y-0 group-focus-within:translate-y-0">
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-red-600 outline-hidden hover:bg-red-50 focus:bg-red-50"
            onClick={() => {
              void signOut().then(() => {
                router.replace("/login");
              });
            }}
          >
            <LogOut size={15} />
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

function getInitials(name?: string) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function AssistantPanel({
  project,
  onClose,
  onOpenAssistant,
}: {
  project: Project;
  onClose: () => void;
  onOpenAssistant: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-[#f0f1f5] p-4">
        <div className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-full bg-[#f0edfa] text-[#7663c8]">
            <Sparkles size={15} />
          </span>
          <div>
            <p className="text-sm font-semibold">Assistant</p>
            <p className="text-[11px] text-[#568568]">Ready · {project.name}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          className="xl:hidden"
          onClick={onClose}
          aria-label="Close assistant"
        >
          <X />
        </Button>
      </div>
      <div className="flex-1 space-y-3 p-4">
        <div className="rounded-lg bg-[#f0f2f7] p-3 text-xs leading-relaxed">
          Payments integration depends on the booking API. I can flag that dependency so dates stay
          realistic.
        </div>
        <Button
          variant="outline"
          className="w-full justify-start text-xs text-[#7663c8]"
          onClick={onOpenAssistant}
        >
          Suggest missing tasks
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start text-xs text-[#7663c8]"
          onClick={onOpenAssistant}
        >
          Check for risks
        </Button>
      </div>
      <div className="border-t border-[#f0f1f5] p-4">
        <div className="flex items-center gap-2 rounded-md border border-[#e2e4ec] px-3 py-2 text-xs text-[#8b8c9d]">
          Ask about your plan...
          <Send size={14} className="ml-auto" />
        </div>
      </div>
    </div>
  );
}
