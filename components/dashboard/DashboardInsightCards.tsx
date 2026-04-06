import Link from "next/link";
import { DashboardProjectSummary } from "@/types";

interface DashboardInsightCardsProps {
  mostActiveProject: DashboardProjectSummary | null;
  leastActiveProject: DashboardProjectSummary | null;
  mostOverdueProject: DashboardProjectSummary | null;
}

interface InsightCardProps {
  label: string;
  value: DashboardProjectSummary | null;
  emptyText: string;
  accent?: "default" | "high" | "low";
  metricLabel: string;
  metricValue?: number;
}

function InsightCard({
  label,
  value,
  emptyText,
  accent = "default",
  metricLabel,
  metricValue,
}: InsightCardProps) {
  return (
    <div className="tf-panel-soft rounded-[1.35rem] p-4">
      <p className="tf-meta">{label}</p>

      {value ? (
        <>
          <Link
            href={`/projects/${value.project.id}`}
            className="mt-3 block text-lg font-semibold text-[rgb(var(--foreground))] transition-opacity hover:opacity-80"
          >
            {value.project.name}
          </Link>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-black/[0.05] px-3 py-1.5 text-xs font-medium text-[rgb(var(--foreground))] dark:bg-white/[0.06]">
              {metricLabel}: {metricValue ?? 0}
            </span>

            <span
              className={
                accent === "high"
                  ? "tf-status-high rounded-full px-3 py-1.5 text-xs font-medium"
                  : accent === "low"
                    ? "tf-status-low rounded-full px-3 py-1.5 text-xs font-medium"
                    : "rounded-full bg-black/[0.05] px-3 py-1.5 text-xs font-medium text-[rgb(var(--muted-foreground))] dark:bg-white/[0.06]"
              }
            >
              Progress: {value.progress}%
            </span>
          </div>
        </>
      ) : (
        <p className="mt-3 text-sm text-[rgb(var(--muted-foreground))]">
          {emptyText}
        </p>
      )}
    </div>
  );
}

export function DashboardInsightCards({
  mostActiveProject,
  leastActiveProject,
  mostOverdueProject,
}: DashboardInsightCardsProps) {
  return (
    <section className="tf-panel tf-noise rounded-[1.75rem] p-5 sm:p-6">
      <p className="tf-meta">Workspace insights</p>
      <h2 className="mt-2 tf-heading text-2xl text-[rgb(var(--foreground))]">
        Project signals
      </h2>
      <p className="mt-3 text-sm leading-7 text-[rgb(var(--muted-foreground))]">
        Quick indicators for activity, quiet projects, and where work is
        slipping.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4">
        <InsightCard
          label="Most active project"
          value={mostActiveProject}
          emptyText="No activity yet."
          metricLabel="Signals"
          metricValue={mostActiveProject?.activityCount}
        />

        <InsightCard
          label="Least active project"
          value={leastActiveProject}
          emptyText="No projects to compare yet."
          accent="low"
          metricLabel="Signals"
          metricValue={leastActiveProject?.activityCount}
        />

        <InsightCard
          label="Most overdue project"
          value={mostOverdueProject}
          emptyText="All clear. No overdue project at the moment."
          accent="high"
          metricLabel="Overdue"
          metricValue={mostOverdueProject?.overdueTasks}
        />
      </div>
    </section>
  );
}
