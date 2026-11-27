import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Project } from "@/lib/mock-data";
import { PageHeader } from "./view-common";

export function AssistantView({
  project,
  onApply,
}: {
  project: Project;
  onApply: (project: Project) => void;
}) {
  const [proposal, setProposal] = useState(true);
  const proposedProject = useMemo(
    () => ({
      ...project,
      phases: [
        ...project.phases,
        {
          id: "testing",
          name: "Testing",
          tone: "pink" as const,
          tasks: [
            {
              id: "qa",
              name: "Beta testing",
              status: "To do" as const,
              priority: "High" as const,
              assignee: "AM",
              due: "16 Jan",
              start: 52,
              span: 8,
              progress: 0,
            },
            {
              id: "feedback",
              name: "Collect launch feedback",
              status: "To do" as const,
              priority: "Medium" as const,
              assignee: "SM",
              due: "20 Jan",
              start: 60,
              span: 6,
              progress: 0,
            },
          ],
        },
      ],
    }),
    [project],
  );
  return (
    <div>
      <PageHeader title="Assistant" description={project.name} />
      <div className="max-w-[620px] space-y-3">
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
