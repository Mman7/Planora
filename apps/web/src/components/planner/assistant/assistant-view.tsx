import { useMemo, useState } from "react";
import { PhaseStatus, Priority, TaskStatus } from "@repo/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Project } from "@/lib/planner-types";
import { PageHeader } from "../view-common";

function buildProposedProject(project: Project): Project {
  return {
    ...project,
    phases: [
      ...project.phases,
      {
        id: "testing",
        projectId: project.id,
        name: "Testing",
        description: null,
        position: project.phases.length,
        startDate: null,
        dueDate: null,
        isOnHold: false,
        status: PhaseStatus.NotStarted,
        progress: 0,
        tone: "pink" as const,
        tasks: [
          {
            id: "qa",
            projectId: project.id,
            phaseId: "testing",
            name: "Beta testing",
            assigneeId: null,
            description: null,
            status: TaskStatus.Todo,
            priority: Priority.High,
            assignee: "AM",
            startDate: null,
            dueDate: "2026-01-16",
            estimatedMinutes: null,
            completedAt: null,
            position: 0,
            due: "16 Jan",
            start: 52,
            span: 8,
            progress: 0,
          },
          {
            id: "feedback",
            projectId: project.id,
            phaseId: "testing",
            name: "Collect launch feedback",
            assigneeId: null,
            description: null,
            status: TaskStatus.Todo,
            priority: Priority.Medium,
            assignee: "SM",
            startDate: null,
            dueDate: "2026-01-20",
            estimatedMinutes: null,
            completedAt: null,
            position: 1,
            due: "20 Jan",
            start: 60,
            span: 6,
            progress: 0,
          },
        ],
      },
    ],
  };
}

export function AssistantView({
  project,
  onApply,
}: {
  project: Project;
  onApply: (project: Project) => void;
}) {
  const [proposal, setProposal] = useState(true);
  const proposedProject = useMemo(() => buildProposedProject(project), [project]);
  return (
    <div>
      <PageHeader title="Assistant" description={project.name} />
      <div className="max-w-155 space-y-3">
        <div className="ml-auto w-fit rounded-lg bg-[#f0edfa] px-3 py-2 text-sm">
          Let&apos;s improve my project plan. What am I missing?
        </div>
        <div className="rounded-lg border border-[#e2e4ec] bg-white px-3 py-2 text-sm">
          Your plan has no testing phase before the beta release. Here is a proposal:
        </div>
        {proposal && (
          <div className="rounded-lg border border-[#e4dff5] bg-[#f0edfa] p-4">
            <h2 className="font-semibold">Add a testing phase</h2>
            <p className="mt-1 text-sm text-[#77788a]">Between Build and Beta release.</p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <Badge className="bg-white text-[#7663c8]">2 new tasks</Badge>
              <Badge className="bg-white text-[#7663c8]">2 new dependencies</Badge>
              <Badge className="bg-[#fbf2df] text-[#a7803d]">Timeline +1 week</Badge>
            </div>
            <div className="mt-4 flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setProposal(false);
                }}
              >
                Reject
              </Button>
              <Button
                onClick={() => {
                  onApply(proposedProject);
                }}
              >
                Apply Changes
              </Button>
            </div>
          </div>
        )}
        <p className="text-xs text-[#8b8c9d]">Nothing changes in your plan until you apply.</p>
      </div>
    </div>
  );
}
