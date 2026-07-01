import type { Project } from "@/types/project";
const STORAGE_KEY = "asbg-projects";
const ACTIVE_PROJECT_KEY = "asbg-active-project";

const listeners = new Set<() => void>();

let projectsSnapshot: Project[] | null = null;
let activeProjectSnapshot: Project | null | undefined;

const DEFAULT_PROJECT: Project = {
  id: "asbg-labs",
  name: "ASBG Labs",
  description: "AI Builder workspace",
  createdAt: new Date(),
  updatedAt: new Date(),
};

export function subscribeToProjects(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

export function getProjects(): Project[] {
  if (projectsSnapshot) return projectsSnapshot;
  if (typeof window === "undefined") return [DEFAULT_PROJECT];

  const stored = localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    projectsSnapshot = [DEFAULT_PROJECT];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projectsSnapshot));
    return projectsSnapshot;
  }

  projectsSnapshot = (JSON.parse(stored) as Project[]).map((project) => ({
    ...project,
    createdAt: new Date(project.createdAt),
    updatedAt: new Date(project.updatedAt),
  }));

  return projectsSnapshot;
}

export function saveProject(project: Project) {
  const projects = getProjects();
  const index = projects.findIndex((p) => p.id === project.id);

  if (index >= 0) {
    projects[index] = project;
  } else {
    projects.push(project);
  }

  projectsSnapshot = projects;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  activeProjectSnapshot = undefined;
  notifyListeners();
}

export function deleteProject(id: string) {
  const projects = getProjects().filter((p) => p.id !== id);
  projectsSnapshot = projects;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  activeProjectSnapshot = undefined;
  notifyListeners();
}

export function setActiveProject(id: string) {
  localStorage.setItem(ACTIVE_PROJECT_KEY, id);
  activeProjectSnapshot = undefined;
  notifyListeners();
}

export function getActiveProject(): Project | null {
  if (activeProjectSnapshot !== undefined) return activeProjectSnapshot;

  const projects = getProjects();
  const activeId =
    typeof window !== "undefined"
      ? localStorage.getItem(ACTIVE_PROJECT_KEY)
      : null;

  activeProjectSnapshot =
    projects.find((p) => p.id === activeId) ?? projects[0] ?? null;

  return activeProjectSnapshot;
}
