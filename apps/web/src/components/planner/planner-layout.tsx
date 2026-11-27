"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  FolderKanban,
  LayoutDashboard,
  ListTodo,
  Menu,
  Settings as SettingsIcon,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { PROJECTS, type Project, type ProjectTab, type View } from "@/lib/mock-data";

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
  selectProject: (id: string) => void;
  openProject: (id: string, tab?: ProjectTab) => void;
  setProjectTab: (tab: ProjectTab) => void;
  updateProject: (project: Project) => void;
};
const PlannerContext = createContext<PlannerContextValue | null>(null);

export function usePlannerLayout() {
  const context = useContext(PlannerContext);
  if (!context) throw new Error("usePlannerLayout must be used inside PlannerLayout");
  return context;
}

export function PlannerLayout({ children }: { children: ReactNode }) {
  const [projectTab, setProjectTab] = useState<ProjectTab>("tasks");
  const [projects, setProjects] = useState(PROJECTS);
  const [selectedProjectId, setSelectedProjectId] = useState("mobile-app");
  const [assistantOpen, setAssistantOpen] = useState(true);
  const [mobileAssistantOpen, setMobileAssistantOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const project = projects.find((item) => item.id === selectedProjectId) ?? projects[0];
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
  const updateProject = (nextProject: Project) => {
    setProjects((current) =>
      current.map((item) => (item.id === nextProject.id ? nextProject : item)),
    );
  };
  const value = { projectTab, project, selectProject, openProject, setProjectTab, updateProject };
  const activeView = pathname === "/" ? "dashboard" : (pathname.slice(1).split("/")[0] as View);
  return (
    <PlannerContext.Provider value={value}>
      <PlannerFrame
        activeView={activeView}
        project={project}
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

function PlannerFrame({
  children,
  activeView,
  project,
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
  navigate: (view: View) => void;
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
  assistantOpen: boolean;
  setAssistantOpen: (open: boolean) => void;
  mobileAssistantOpen: boolean;
  setMobileAssistantOpen: (open: boolean) => void;
}) {
  return (
    <div className="min-h-screen bg-[#f7f8fc] text-[#25243a]">
      <div className="flex min-h-screen">
        <Sidebar activeView={activeView} onNavigate={navigate} />
        <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
          <SheetContent side="left" className="w-[230px] p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation</SheetTitle>
            </SheetHeader>
            <Sidebar activeView={activeView} onNavigate={navigate} mobile />
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
          <div className="mx-auto max-w-[980px] px-4 py-6 md:px-8 md:py-8">{children}</div>
        </main>
        <aside
          className={cn(
            "hidden w-[286px] shrink-0 border-l border-[#e5e7ef] bg-white xl:block",
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
          <SheetContent side="right" className="w-full max-w-[360px] p-0">
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
      <span className="font-semibold">Planly</span>
      <Button variant="ghost" size="icon" onClick={onOpenAssistant} aria-label="Open assistant">
        <Sparkles />
      </Button>
    </div>
  );
}

function Sidebar({
  activeView,
  onNavigate,
  mobile = false,
}: {
  activeView: View;
  onNavigate: (view: View) => void;
  mobile?: boolean;
}) {
  return (
    <aside
      className={cn(
        "flex w-[230px] shrink-0 flex-col border-r border-[#e5e7ef] bg-white px-3 py-5",
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
        <span className="font-semibold tracking-tight">Planly</span>
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
      <div className="mt-auto flex items-center gap-3 border-t border-[#f0f1f5] px-3 pt-5">
        <span className="grid size-8 place-items-center rounded-full bg-[#e8e2fa] text-xs font-medium text-[#7663c8]">
          AM
        </span>
        <div>
          <p className="text-xs font-medium">Aisha Musa</p>
          <p className="text-[11px] text-[#858698]">Free plan</p>
        </div>
      </div>
    </aside>
  );
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
