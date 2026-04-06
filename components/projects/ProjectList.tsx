import { Project } from "@/types";
import { ProjectCard } from "./ProjectCard";

interface Props {
  projects: Project[];
}

export function ProjectList({ projects }: Props) {
  if (projects.length === 0) {
    return (
      <div className="tf-panel-soft rounded-[1.5rem] px-6 py-16 text-center">
        <p className="tf-meta">Empty workspace</p>
        <p className="mt-3 text-xl font-semibold text-[rgb(var(--foreground))]">
          No projects yet
        </p>
        <p className="mt-2 text-sm text-[rgb(var(--muted-foreground))]">
          Create your first project to start planning tasks, members, and
          workflow.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
}
