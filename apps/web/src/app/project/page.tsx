import { Suspense } from "react";
import { ProjectContent } from "./project-content";

export default function ProjectPage() {
  return (
    <Suspense fallback={<ProjectLoadingFallback />}>
      <ProjectContent />
    </Suspense>
  );
}

function ProjectLoadingFallback() {
  return (
    <div className="space-y-4" aria-label="Loading project">
      <div className="h-8 w-64 animate-pulse rounded-md bg-[#e5e7ef]" />
      <div className="h-24 animate-pulse rounded-lg border border-[#e2e4ec] bg-white" />
    </div>
  );
}
