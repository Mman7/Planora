"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  createMockSettingsRepository,
  SETTINGS_SECTIONS,
  useSettingsStore,
  type SettingsSection,
} from "@/lib/settings";
import { usePlannerLayout } from "../planner-layout";
import { PageHeader } from "../view-common";
import { ProfileSettingsSection } from "./sections/profile-settings";
import { WorkspaceSettingsSection } from "./sections/workspace-settings";
import { WorkingTimeSettingsSection } from "./sections/working-time-settings";
import { CalendarSettingsSection } from "./sections/calendar-settings";
import { AIProviderSettingsSection } from "./sections/ai-provider-settings";
import { NotificationSettingsSection } from "./sections/notification-settings";
import { AccountSettingsSection } from "./sections/account-settings";

export function SettingsView() {
  const { user } = usePlannerLayout();
  const {
    loading,
    saveStatus,
    saveError,
    activeSection,
    setActiveSection,
    setRepository,
    loadSettings,
    isDirty,
    saveChanges,
  } = useSettingsStore();

  const sectionRefs = useRef<Map<SettingsSection, HTMLElement>>(new Map());
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isScrollingProgrammatically, setIsScrollingProgrammatically] = useState(false);

  const repository = useMemo(() => {
    if (!user) return null;
    return createMockSettingsRepository(user.name, user.email);
  }, [user]);

  useEffect(() => {
    if (repository) {
      setRepository(repository);
      void loadSettings();
    }
  }, [repository, setRepository, loadSettings]);

  const registerSection = useCallback((id: SettingsSection, el: HTMLElement | null) => {
    if (el) {
      sectionRefs.current.set(id, el);
    } else {
      sectionRefs.current.delete(id);
    }
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (isScrollingProgrammatically) return;

      const containerTop = container.getBoundingClientRect().top;
      let closestSection: SettingsSection = "profile";
      let closestDistance = Infinity;

      for (const [id, el] of sectionRefs.current) {
        const rect = el.getBoundingClientRect();
        const distance = Math.abs(rect.top - containerTop - 20);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestSection = id;
        }
      }

      setActiveSection(closestSection);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [setActiveSection, isScrollingProgrammatically]);

  const scrollToSection = useCallback(
    (id: SettingsSection) => {
      const el = sectionRefs.current.get(id);
      if (!el) return;

      setActiveSection(id);
      setIsScrollingProgrammatically(true);

      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      el.scrollIntoView({
        behavior: prefersReducedMotion ? "instant" : "smooth",
        block: "start",
      });

      if (window.location.hash !== `#${id}`) {
        window.history.replaceState(null, "", `#${id}`);
      }

      setTimeout(() => setIsScrollingProgrammatically(false), 500);
    },
    [setActiveSection],
  );

  useEffect(() => {
    if (!loading) {
      const hash = window.location.hash.slice(1) as SettingsSection;
      if (SETTINGS_SECTIONS.some((s) => s.id === hash)) {
        setTimeout(() => scrollToSection(hash), 100);
      }
    }
  }, [loading, scrollToSection]);

  const handleSave = async () => {
    if (!isDirty()) return;
    await saveChanges();
    if (useSettingsStore.getState().saveStatus === "success") {
      toast.success("Settings saved successfully");
    } else if (useSettingsStore.getState().saveStatus === "error") {
      toast.error("Failed to save some settings");
    }
  };

  const dirty = isDirty();

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Manage your profile, workspace and preferences."
        action={
          <Button onClick={handleSave} disabled={!dirty || saveStatus === "saving"}>
            {saveStatus === "saving" && <Loader2 className="animate-spin" />}
            {saveStatus === "success" && <Check />}
            {saveStatus === "success" ? "Changes saved" : "Save changes"}
          </Button>
        }
      />
      {saveError && (
        <div className="mb-4 rounded-lg bg-[#f9eaea] px-4 py-3 text-sm text-[#b96b72]">
          {saveError}
        </div>
      )}
      <div className="grid gap-6 md:grid-cols-[150px_1fr]">
        <SettingsNavigation
          activeSection={activeSection}
          onSelect={scrollToSection}
        />
        <div ref={scrollContainerRef} className="space-y-4">
          {loading ? (
            <SettingsLoadingSkeleton />
          ) : (
            <>
              <ProfileSettingsSection registerRef={registerSection} />
              <WorkspaceSettingsSection registerRef={registerSection} />
              <WorkingTimeSettingsSection registerRef={registerSection} />
              <CalendarSettingsSection registerRef={registerSection} />
              <AIProviderSettingsSection registerRef={registerSection} />
              <NotificationSettingsSection registerRef={registerSection} />
              <AccountSettingsSection registerRef={registerSection} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function SettingsNavigation({
  activeSection,
  onSelect,
}: {
  activeSection: SettingsSection;
  onSelect: (id: SettingsSection) => void;
}) {
  return (
    <>
      {/* Desktop: vertical nav */}
      <nav
        className="sticky top-8 hidden space-y-1 self-start text-sm text-[#77788a] md:block"
        aria-label="Settings sections"
      >
        {SETTINGS_SECTIONS.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={cn(
              "block w-full rounded-md px-3 py-2 text-left transition-colors hover:bg-[#f5f3fc] hover:text-[#25243a]",
              activeSection === item.id && "bg-[#f0edfa] font-medium text-[#7663c8]",
            )}
          >
            {item.label}
          </button>
        ))}
      </nav>
      {/* Mobile: horizontal scrollable nav */}
      <div className="flex gap-1 overflow-x-auto pb-2 md:hidden" role="tablist">
        {SETTINGS_SECTIONS.map((item) => (
          <button
            key={item.id}
            role="tab"
            aria-selected={activeSection === item.id}
            onClick={() => onSelect(item.id)}
            className={cn(
              "shrink-0 rounded-md px-3 py-1.5 text-xs whitespace-nowrap transition-colors",
              activeSection === item.id
                ? "bg-[#f0edfa] font-medium text-[#7663c8]"
                : "text-[#77788a] hover:bg-[#f5f3fc]",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>
    </>
  );
}

function SettingsLoadingSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-lg border border-[#e2e4ec] bg-white p-4">
          <div className="mb-3 h-4 w-24 rounded bg-[#f0f2f7]" />
          <div className="space-y-3">
            <div className="h-8 w-full rounded bg-[#f0f2f7]" />
            <div className="h-8 w-3/4 rounded bg-[#f0f2f7]" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SettingsGroup({
  id,
  title,
  children,
  registerRef,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
  registerRef?: (id: SettingsSection, el: HTMLElement | null) => void;
}) {
  const ref = useCallback(
    (el: HTMLElement | null) => {
      registerRef?.(id as SettingsSection, el);
    },
    [id, registerRef],
  );

  return (
    <section
      ref={ref}
      id={id}
      className="scroll-mt-4 overflow-hidden rounded-lg border border-[#e2e4ec] bg-white"
    >
      <h2 className="border-b border-[#e5e7ef] px-4 py-3 text-sm font-semibold">{title}</h2>
      {children}
    </section>
  );
}

export function SettingRow({
  label,
  description,
  children,
  htmlFor,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#e5e7ef] px-4 py-3 text-sm last:border-0">
      <div className="min-w-0 shrink-0">
        <label htmlFor={htmlFor} className="font-medium text-[#25243a]">
          {label}
        </label>
        {description && <p className="mt-0.5 text-xs text-[#77788a]">{description}</p>}
      </div>
      <div className="flex min-w-0 items-center justify-end gap-2">{children}</div>
    </div>
  );
}
