import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "../view-common";

export function CreateProjectView({
  onGenerated,
}: {
  onGenerated: (name: string, description: string) => Promise<void>;
}) {
  const [description, setDescription] = useState("");
  const [generating, setGenerating] = useState(false);
  const [name, setName] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const examples = ["Launch a podcast", "Redesign our website", "Plan a team offsite"];
  const generate = () => {
    setGenerating(true);
    void onGenerated(name.trim() || description.trim().slice(0, 60), description).finally(() => {
      setGenerating(false);
    });
  };
  return (
    <div>
      <PageHeader
        title="Create your project"
        description="Describe it the way you would to a teammate. I will turn it into a plan."
      />
      <div className="rounded-lg border border-[#e2e4ec] bg-white p-4 md:p-5">
        <label htmlFor="project-description" className="text-sm font-semibold">
          What are you planning to build?
        </label>
        <Textarea
          id="project-description"
          value={description}
          onChange={(event) => {
            setDescription(event.target.value);
          }}
          placeholder="e.g. A mobile app for booking local fitness classes, launching in 3 months with a team of 4..."
          className="mt-3 min-h-29 resize-none"
        />
        <p className="mt-3 text-xs text-[#77788a]">Try an example</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {examples.map((example) => (
            <Button
              key={example}
              variant="outline"
              size="sm"
              onClick={() => {
                setDescription(example);
              }}
            >
              {example}
            </Button>
          ))}
        </div>
      </div>
      <div className="mt-4 grid gap-4 rounded-lg border border-[#e2e4ec] bg-white p-4 md:grid-cols-3 md:p-5">
        <label className="text-xs font-medium">
          Project name (optional)
          <Input
            className="mt-2"
            placeholder="Let AI suggest one"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
            }}
          />
        </label>
        <label className="text-xs font-medium">
          Target date (optional)
          <DatePicker value={targetDate} onChange={setTargetDate} />
        </label>
        <label className="text-xs font-medium">
          Team size
          <Input className="mt-2" placeholder="Just me" />
        </label>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <Button onClick={generate} disabled={generating || !description.trim()}>
          {generating ? "Thinking through your plan..." : "Generate Project Plan"}
        </Button>
        {description && (
          <span className="text-xs text-[#77788a]">AI will suggest phases, tasks, and dates.</span>
        )}
      </div>
    </div>
  );
}
