"use client";

import { Chat } from "@/components/Chat";
import { WorkspaceSidebar } from "@/components/workspace/WorkspaceSidebar";

export function Workspace() {
  return (
    <main>
      <WorkspaceSidebar />

      <section>
        <Chat />
      </section>
    </main>
  );
}
