import Link from "next/link";
import { ProjectActivity } from "@/types";

interface DashboardRecentActivityProps {
  activity: ProjectActivity[];
}

export function DashboardRecentActivity({
  activity,
}: DashboardRecentActivityProps) {
  return (
    <section className="tf-panel tf-noise rounded-[1.75rem] p-5 sm:p-6">
      <p className="tf-meta">Workspace feed</p>
      <h2 className="mt-2 tf-heading text-2xl text-[rgb(var(--foreground))]">
        Recent activity
      </h2>
      <p className="mt-3 text-sm leading-7 text-[rgb(var(--muted-foreground))]">
        Cross-project changes and collaboration updates across your workspace.
      </p>

      <div className="mt-6 space-y-3">
        {activity.length === 0 ? (
          <div className="tf-panel-soft rounded-[1.35rem] p-5">
            <p className="text-base font-medium text-[rgb(var(--foreground))]">
              No recent activity
            </p>
            <p className="mt-2 text-sm text-[rgb(var(--muted-foreground))]">
              Project actions and team changes will appear here.
            </p>
          </div>
        ) : (
          activity.map((item) => (
            <Link
              key={item.id}
              href={`/projects/${item.project_id}`}
              className="tf-panel-soft block rounded-[1.35rem] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-black/10 dark:hover:border-white/10"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[rgb(var(--foreground))]">
                    {item.description}
                  </p>

                  <p className="mt-1 text-xs text-[rgb(var(--muted-foreground))]">
                    {item.actor?.full_name ||
                      item.actor?.email ||
                      "Unknown user"}
                  </p>
                </div>

                <p className="shrink-0 text-xs text-[rgb(var(--muted-foreground))]">
                  {new Date(item.created_at).toLocaleString()}
                </p>
              </div>
            </Link>
          ))
        )}
      </div>
    </section>
  );
}
