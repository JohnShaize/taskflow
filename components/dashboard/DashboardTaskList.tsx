import Link from "next/link";
import { Task } from "@/types";
import { cn } from "@/lib/utils";

interface DashboardTaskListProps {
  title: string;
  subtitle: string;
  tasks: Task[];
  emptyTitle: string;
  emptyText: string;
  showDueDate?: boolean;
}

const priorityClasses = {
  low: "tf-status-low",
  medium: "tf-status-medium",
  high: "tf-status-high",
};

export function DashboardTaskList({
  title,
  subtitle,
  tasks,
  emptyTitle,
  emptyText,
  showDueDate = true,
}: DashboardTaskListProps) {
  return (
    <section className="tf-panel tf-noise rounded-[1.75rem] p-5 sm:p-6">
      <p className="tf-meta">Task focus</p>
      <h2 className="mt-2 tf-heading text-2xl text-[rgb(var(--foreground))]">
        {title}
      </h2>
      <p className="mt-3 text-sm leading-7 text-[rgb(var(--muted-foreground))]">
        {subtitle}
      </p>

      <div className="mt-6 space-y-3">
        {tasks.length === 0 ? (
          <div className="tf-panel-soft rounded-[1.35rem] p-5">
            <p className="text-base font-medium text-[rgb(var(--foreground))]">
              {emptyTitle}
            </p>
            <p className="mt-2 text-sm text-[rgb(var(--muted-foreground))]">
              {emptyText}
            </p>
          </div>
        ) : (
          tasks.map((task) => {
            const dueDate = task.due_date;
            const today = new Date().toISOString().slice(0, 10);

            const isOverdue =
              !!dueDate && task.status !== "done" && dueDate < today;

            return (
              <Link
                key={task.id}
                href={`/projects/${task.project_id}`}
                className="tf-panel-soft block rounded-[1.35rem] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-black/10 dark:hover:border-white/10"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="line-clamp-2 text-sm font-semibold text-[rgb(var(--foreground))]">
                      {task.title}
                    </p>

                    {task.description && (
                      <p className="mt-2 line-clamp-2 text-sm text-[rgb(var(--muted-foreground))]">
                        {task.description}
                      </p>
                    )}
                  </div>

                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium capitalize",
                      priorityClasses[task.priority],
                    )}
                  >
                    {task.priority}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-black/[0.05] px-3 py-1.5 text-xs font-medium text-[rgb(var(--foreground))] dark:bg-white/[0.06]">
                      {task.status.replace("_", " ")}
                    </span>

                    <span className="rounded-full bg-black/[0.05] px-3 py-1.5 text-xs font-medium text-[rgb(var(--muted-foreground))] dark:bg-white/[0.06]">
                      {task.assignee?.full_name ?? "Unassigned"}
                    </span>
                  </div>

                  {showDueDate && (
                    <span
                      className={cn(
                        "text-xs font-medium",
                        isOverdue
                          ? "text-red-300"
                          : "text-[rgb(var(--muted-foreground))]",
                      )}
                    >
                      {dueDate
                        ? `Due ${new Date(dueDate).toLocaleDateString()}`
                        : "No due date"}
                    </span>
                  )}
                </div>
              </Link>
            );
          })
        )}
      </div>
    </section>
  );
}
