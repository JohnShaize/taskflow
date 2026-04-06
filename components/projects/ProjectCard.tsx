import Link from "next/link";
import { Project } from "@/types";

interface Props {
  project: Project;
}

function ArrowUpRightIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[16px] w-[16px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M7 17 17 7" />
      <path d="M9 7h8v8" />
    </svg>
  );
}

function getInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || "P";
}

export function ProjectCard({ project }: Props) {
  return (
    <Link
      href={`/projects/${project.id}`}
      data-testid="project-card"
      className="tf-panel-soft group block rounded-[1.45rem] p-5 transition-all duration-200 hover:-translate-y-1 hover:border-black/10 hover:shadow-[0_24px_60px_rgba(15,23,42,0.08)] dark:hover:border-white/10 dark:hover:shadow-[0_24px_60px_rgba(0,0,0,0.35)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[rgba(var(--ring),0.16)] text-base font-semibold text-[rgb(var(--foreground))] shadow-[0_10px_28px_rgba(99,102,241,0.18)]">
          {getInitial(project.name)}
        </div>

        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-black/[0.04] text-[rgb(var(--muted-foreground))] transition-colors group-hover:text-[rgb(var(--foreground))] dark:bg-white/[0.04]">
          <ArrowUpRightIcon />
        </span>
      </div>

      <div className="mt-5">
        <p className="tf-meta">Project</p>
        <h3 className="mt-2 line-clamp-2 text-[20px] font-semibold tracking-[-0.03em] text-[rgb(var(--foreground))]">
          {project.name}
        </h3>

        <p className="mt-3 line-clamp-3 min-h-[72px] text-sm leading-7 text-[rgb(var(--muted-foreground))]">
          {project.description || "No description added yet."}
        </p>
      </div>

      <div className="mt-5 flex items-end justify-between gap-3">
        <div>
          <p className="tf-meta">Created</p>
          <p className="mt-1 text-sm text-[rgb(var(--muted-foreground))]">
            {new Date(project.created_at).toLocaleDateString()}
          </p>
        </div>

        <span className="rounded-full bg-black/[0.05] px-3 py-1.5 text-xs font-medium text-[rgb(var(--foreground))] dark:bg-white/[0.06]">
          Open workspace
        </span>
      </div>
    </Link>
  );
}
