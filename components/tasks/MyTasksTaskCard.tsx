import Link from "next/link";
import { Task } from "@/types";

const priorityClasses = {
  low: "tf-status-low",
  medium: "tf-status-medium",
  high: "tf-status-high",
};

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

function EditIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[16px] w-[16px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="m4 20 4.2-1 9.4-9.4a2.2 2.2 0 0 0-3.1-3.1L5.1 15.9 4 20Z" />
      <path d="m13.5 7.5 3 3" />
    </svg>
  );
}

interface MyTasksTaskCardProps {
  task: Task;
  projectName: string;
  onQuickEdit: (taskId: string) => void;
}

export function MyTasksTaskCard({
  task,
  projectName,
  onQuickEdit,
}: MyTasksTaskCardProps) {
  const isOverdue =
    Boolean(task.due_date) &&
    task.status !== "done" &&
    task.due_date! < new Date().toISOString().slice(0, 10);

  return (
    <div className="tf-panel-soft rounded-[1.35rem] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-black/10 dark:hover:border-white/10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="tf-meta">Task</span>
            <span className="rounded-full bg-black/[0.05] px-3 py-1.5 text-xs font-medium text-[rgb(var(--muted-foreground))] dark:bg-white/[0.06]">
              {projectName}
            </span>
          </div>

          <h3 className="mt-2 line-clamp-2 text-lg font-semibold tracking-[-0.03em] text-[rgb(var(--foreground))]">
            {task.title}
          </h3>

          {task.description && (
            <p className="mt-3 line-clamp-2 text-sm leading-7 text-[rgb(var(--muted-foreground))]">
              {task.description}
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-black/[0.05] px-3 py-1.5 text-xs font-medium capitalize text-[rgb(var(--foreground))] dark:bg-white/[0.06]">
              {task.status.replace("_", " ")}
            </span>

            <span
              className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize ${priorityClasses[task.priority]}`}
            >
              {task.priority}
            </span>

            <span className="rounded-full bg-black/[0.05] px-3 py-1.5 text-xs font-medium text-[rgb(var(--muted-foreground))] dark:bg-white/[0.06]">
              {task.assignee?.full_name ?? "Unassigned"}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-start gap-3 lg:items-end">
          <div className="text-left lg:text-right">
            <p className="tf-meta">Due</p>
            <p
              className={[
                "mt-2 text-sm font-medium",
                isOverdue
                  ? "text-red-300"
                  : "text-[rgb(var(--muted-foreground))]",
              ].join(" ")}
            >
              {task.due_date
                ? new Date(task.due_date).toLocaleDateString()
                : "No due date"}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onQuickEdit(task.id)}
              className="tf-btn-secondary inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium"
            >
              <EditIcon />
              Quick edit
            </button>

            <Link
              href={`/projects/${task.project_id}`}
              className="tf-btn-primary inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium"
            >
              <ArrowUpRightIcon />
              Open board
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
