"use client";

import {
  FileText,
  Folder,
  Inbox,
  LayoutGrid,
  Settings,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/mock-data";
import type { PlannerView } from "@/types/planner";

const ICONS: Record<string, LucideIcon> = {
  LayoutGrid,
  Folder,
  Inbox,
  FileText,
  Settings,
};

interface SidebarProps {
  activeView: PlannerView;
  onNavigate: (view: PlannerView) => void;
  onClose?: () => void;
}

export function Sidebar({ activeView, onNavigate, onClose }: SidebarProps) {
  return (
    <aside className="flex h-full w-[230px] shrink-0 flex-col border-r border-border bg-white px-3 py-5">
      <div className="flex items-center gap-2 px-3 pb-7 text-sm font-semibold text-foreground">
        <span className="grid size-6 place-items-center rounded-md bg-primary-soft text-primary">
          <Sparkles className="size-3.5" />
        </span>
        Planly
      </div>

      <nav className="space-y-1" aria-label="Primary navigation">
        {NAV_ITEMS.map((item) => {
          const Icon = ICONS[item.icon];
          const isActive = activeView === item.id;
          return (
            <Button
              key={item.id}
              variant="ghost"
              className={cn(
                "h-9 w-full justify-start gap-3 px-3 text-sm font-normal text-muted-foreground hover:bg-primary-soft hover:text-primary",
                isActive &&
                  "bg-primary-soft font-medium text-primary hover:bg-primary-soft hover:text-primary",
              )}
              onClick={() => {
                onNavigate(item.id);
                onClose?.();
              }}
            >
              <Icon className="size-4" />
              {item.label}
            </Button>
          );
        })}
      </nav>

      <div className="mt-auto flex items-center gap-3 px-2 pt-8">
        <div className="grid size-8 place-items-center rounded-full bg-primary-soft text-xs font-medium text-primary">
          AM
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-foreground">
            Aisha Musa
          </p>
          <p className="text-[11px] text-muted-foreground">Free plan</p>
        </div>
      </div>
    </aside>
  );
}
