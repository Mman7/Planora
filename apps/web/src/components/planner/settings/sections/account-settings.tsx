"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Trash2 } from "lucide-react";
import { signOut } from "@/lib/auth";
import { usePlannerLayout } from "../../planner-layout";
import type { SettingsSection } from "@/lib/settings";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { SettingsGroup, SettingRow } from "../settings-view";

type SectionProps = {
  registerRef: (id: SettingsSection, el: HTMLElement | null) => void;
};

export function AccountSettingsSection({ registerRef }: SectionProps) {
  const { user } = usePlannerLayout();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      router.replace("/login");
    } catch {
      setSigningOut(false);
    }
  };

  return (
    <SettingsGroup id="account" title="Account" registerRef={registerRef}>
      <SettingRow label="Email">
        <span className="text-xs text-[#77788a]">{user?.email ?? "—"}</span>
      </SettingRow>
      <SettingRow label="Account status">
        <Badge className="bg-[#e8f4ec] text-[#568568]">Active</Badge>
      </SettingRow>
      <SettingRow label="Password">
        <Button variant="outline" size="sm" disabled>
          Change password
        </Button>
      </SettingRow>
      <div className="border-t border-[#e5e7ef] px-4 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <AlertDialog>
            <AlertDialogTrigger
              render={
                <Button variant="outline" size="sm" disabled={signingOut}>
                  <LogOut size={14} />
                  {signingOut ? "Signing out..." : "Sign out"}
                </Button>
              }
            />
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Sign out</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to sign out? Any unsaved changes will be lost.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleSignOut}>Sign out</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button variant="destructive" size="sm" disabled>
            <Trash2 size={14} />
            Delete account
          </Button>
        </div>
        <p className="mt-2 text-xs text-[#77788a]">
          Account deletion is not available yet. Contact support for assistance.
        </p>
      </div>
    </SettingsGroup>
  );
}
