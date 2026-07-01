import { useSyncExternalStore } from "react";
import {
  getActiveProject,
  subscribeToProjects,
} from "@/lib/projects/projectStore";

function getProjectSnapshot() {
  return getActiveProject();
}

export function useProject() {
  const project = useSyncExternalStore(
    subscribeToProjects,
    getProjectSnapshot,
    () => null,
  );

  return {
    project,
  };
}
