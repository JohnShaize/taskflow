import Link from "next/link";
import { DashboardProjectSummary } from "@/types";

interface DashboardProjectSummaryGridProps {
  summaries: DashboardProjectSummary[];
}

export function DashboardProjectSummaryGrid({
  summaries,
}: DashboardProjectSummaryGridProps) {
  return (
    <section className="tf-panel tf-noise rounded-[1.75rem] p-5 sm:p-6">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="tf-meta">Workspace health</p>
          <h2 className="mt-2 tf-heading text-2xl text-[rgb(var(--foreground))]">
            Project overview
          </h2>
          <p className="mt-3 text-sm leading-7 text-[rgb(var(--muted-foreground))]">
            Progress, overdue work, and member coverage across your active
            projects.
          </p>
        </div>
      </div>

      {summaries.length === 0 ? (
        <div className="tf-panel-soft rounded-[1.35rem] p-5">
          <p className="text-base font-medium text-[rgb(var(--foreground))]">
            No projects yet
          </p>
          <p className="mt-2 text-sm text-[rgb(var(--muted-foreground))]">
            Create your first project to start tracking project health.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {summaries.map((summary) => (
            <Link
              key={summary.project.id}
              href={`/projects/${summary.project.id}`}
              className="tf-panel-soft block rounded-[1.45rem] p-5 transition-all duration-200 hover:-translate-y-1 hover:border-black/10 dark:hover:border-white/10"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="tf-meta">Project</p>
                  <h3 className="mt-2 line-clamp-2 text-[20px] font-semibold tracking-[-0.03em] text-[rgb(var(--foreground))]">
                    {summary.project.name}
                  </h3>
                </div>

                <span className="rounded-full bg-black/[0.05] px-3 py-1.5 text-xs font-medium text-[rgb(var(--foreground))] dark:bg-white/[0.06]">
                  {summary.progress}%
                </span>
              </div>

              <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-black/[0.05] dark:bg-white/[0.06]">
                <div
                  className="h-full rounded-full bg-[rgb(var(--foreground))]"
                  style={{ width: `${summary.progress}%` }}
                />
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div>
                  <p className="tf-meta">Open</p>
                  <p className="mt-2 text-xl font-semibold text-[rgb(var(--foreground))]">
                    {summary.openTasks}
                  </p>
                </div>

                <div>
                  <p className="tf-meta">Overdue</p>
                  <p className="mt-2 text-xl font-semibold text-red-300">
                    {summary.overdueTasks}
                  </p>
                </div>

                <div>
                  <p className="tf-meta">Members</p>
                  <p className="mt-2 text-xl font-semibold text-[rgb(var(--foreground))]">
                    {summary.membersCount}
                  </p>
                </div>

                <div>
                  <p className="tf-meta">Done</p>
                  <p className="mt-2 text-xl font-semibold text-[rgb(var(--foreground))]">
                    {summary.completedTasks}
                  </p>
                </div>
              </div>

              <p className="mt-5 text-xs text-[rgb(var(--muted-foreground))]">
                {summary.lastActivityAt
                  ? `Last activity ${new Date(summary.lastActivityAt).toLocaleDateString()}`
                  : "No recent activity"}
              </p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
