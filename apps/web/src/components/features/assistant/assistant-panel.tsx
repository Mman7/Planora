"use client";

import { Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ASSISTANT_PROPOSAL } from "@/lib/mock-data";
import type { PlannerView } from "@/types/planner";

interface AssistantPanelProps {
  view: PlannerView;
  onOpenAssistant: () => void;
}

const CONTEXT: Record<PlannerView, string> = {
  dashboard: "Dashboard",
  create: "New project",
  projects: "Mobile app launch",
  timeline: "Timeline",
  assistant: "Mobile app launch",
  settings: "Settings",
};

export function AssistantPanel({ view, onOpenAssistant }: AssistantPanelProps) {
  const isProject =
    view === "projects" || view === "timeline" || view === "assistant";
  return (
    <aside className="hidden w-[320px] shrink-0 flex-col border-l border-border bg-white lg:flex">
      <AssistantHeader context={CONTEXT[view]} />
      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        {view === "dashboard" && (
          <DashboardAssistant onOpenAssistant={onOpenAssistant} />
        )}
        {view === "create" && <CreateAssistant />}
        {isProject && (
          <ProjectAssistant view={view} onOpenAssistant={onOpenAssistant} />
        )}
        {view === "settings" && <SettingsAssistant />}
      </div>
      <AssistantComposer />
    </aside>
  );
}

function AssistantHeader({ context }: { context: string }) {
  return (
    <div className="border-b border-border p-5">
      <div className="flex items-center gap-3">
        <span className="grid size-8 place-items-center rounded-full bg-primary-soft text-primary">
          <Sparkles className="size-4" />
        </span>
        <div>
          <h2 className="text-sm font-semibold">Assistant</h2>
          <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <span className="size-1.5 rounded-full bg-emerald-500" /> Ready ·{" "}
            {context}
          </p>
        </div>
      </div>
    </div>
  );
}

function DashboardAssistant({
  onOpenAssistant,
}: {
  onOpenAssistant: () => void;
}) {
  return (
    <>
      <p className="rounded-lg bg-muted px-3 py-3 text-xs leading-5 text-foreground">
        You have 2 tasks due this week. Want me to suggest an order for them?
      </p>
      <SuggestionButton label="Plan my week" onClick={onOpenAssistant} />
      <SuggestionButton
        label="Which project is at risk?"
        onClick={onOpenAssistant}
      />
    </>
  );
}

function CreateAssistant() {
  return (
    <>
      <p className="rounded-lg bg-muted px-3 py-3 text-xs leading-5 text-foreground">
        A few quick questions so your plan fits:
      </p>
      <div className="rounded-lg border border-ai-border bg-ai-surface p-3 text-xs">
        <p className="font-semibold">Which platforms?</p>
        <div className="mt-2 flex gap-2">
          <MiniChoice label="iOS" />
          <MiniChoice label="Android" />
          <MiniChoice label="Both" />
        </div>
        <p className="mt-3 font-semibold">Do you already have designs?</p>
        <div className="mt-2 flex gap-2">
          <MiniChoice label="Yes" />
          <MiniChoice label="Not yet" />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Thinking through your plan...
      </p>
    </>
  );
}

function ProjectAssistant({
  view,
  onOpenAssistant,
}: {
  view: PlannerView;
  onOpenAssistant: () => void;
}) {
  if (view === "assistant") {
    return (
      <>
        <p className="text-xs text-muted-foreground">Recent conversations</p>
        <div className="space-y-1 text-xs">
          <p className="px-2 py-2">Improve my plan</p>
          <p className="px-2 py-2">Estimate build phase</p>
          <p className="px-2 py-2">Risk check</p>
        </div>
        <div className="rounded-lg border border-ai-border bg-ai-surface p-3 text-xs">
          <p className="font-semibold">Risk spotted</p>
          <p className="mt-2 leading-5 text-muted-foreground">
            Payments integration has no buffer before launch.
          </p>
        </div>
      </>
    );
  }
  return (
    <>
      <p className="rounded-lg bg-muted px-3 py-3 text-xs leading-5 text-foreground">
        Payments integration depends on the booking API. I can flag that
        dependency so dates stay realistic.
      </p>
      <SuggestionButton
        label="Suggest missing tasks"
        onClick={onOpenAssistant}
      />
      <SuggestionButton label="Check for risks" onClick={onOpenAssistant} />
      {view === "timeline" && (
        <div className="rounded-lg border border-ai-border bg-ai-surface p-3 text-xs">
          <p className="font-semibold">Wireframes</p>
          <p className="mt-2 text-muted-foreground">
            1 Dec - 19 Dec · 60% done
          </p>
          <p className="mt-2 text-muted-foreground">Blocks: Style guide</p>
        </div>
      )}
    </>
  );
}

function SettingsAssistant() {
  return (
    <p className="rounded-lg bg-muted px-3 py-3 text-xs leading-5 text-foreground">
      I use your working days and hours when I estimate timelines.
    </p>
  );
}

function SuggestionButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      variant="outline"
      className="h-8 w-full justify-start border-ai-border bg-ai-surface px-3 text-xs font-normal text-primary hover:bg-primary-soft"
      onClick={onClick}
    >
      {label}
    </Button>
  );
}

function MiniChoice({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="rounded-md border border-ai-border bg-white px-2.5 py-1.5 text-xs text-primary transition-colors hover:bg-primary-soft"
    >
      {label}
    </button>
  );
}

function AssistantComposer() {
  return (
    <div className="border-t border-border p-4">
      <div className="relative">
        <Input
          className="h-9 pr-9 text-xs"
          placeholder="Ask about your plan..."
        />
        <Button
          size="icon-sm"
          variant="ghost"
          className="absolute top-1 right-1 text-muted-foreground"
          aria-label="Send message"
        >
          <Send />
        </Button>
      </div>
    </div>
  );
}
