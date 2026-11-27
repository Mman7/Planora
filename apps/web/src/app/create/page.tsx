"use client";

import { useRouter } from "next/navigation";
import { CreateProjectView } from "@/components/planner/create-project-view";

export default function CreatePage() {
  const router = useRouter();
  return (
    <CreateProjectView
      onGenerated={() => {
        router.push("/project?id=mobile-app");
      }}
    />
  );
}
