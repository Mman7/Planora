import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export const statusClasses: Record<string, string> = {
  "In progress": "bg-[#e9f0fa] text-[#6483b2]",
  "On track": "bg-[#e8f4ec] text-[#568568]",
  "At risk": "bg-[#fbf2df] text-[#a7803d]",
  Done: "bg-[#e8f4ec] text-[#568568]",
  "To do": "bg-[#f0f2f7] text-[#77788a]",
};

export const phaseColors = {
  teal: "#68aaa5",
  orange: "#e2a44e",
  pink: "#ca8aa8",
  purple: "#7663c8",
} as const;

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header className="mb-6 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.03em]">{title}</h1>
        {description && <p className="mt-1 text-[13px] text-[#77788a]">{description}</p>}
      </div>
      {action}
    </header>
  );
}

export function SectionTitle({ children, count }: { children: ReactNode; count?: string }) {
  return (
    <div className="mb-2 flex items-center gap-2">
      <h2 className="text-[15px] font-semibold">{children}</h2>
      {count && <span className="text-xs text-[#8b8c9d]">{count}</span>}
    </div>
  );
}

export { cn };
