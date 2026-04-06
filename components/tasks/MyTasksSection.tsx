import { Task } from "@/types";
import { MyTasksTaskCard } from "./MyTasksTaskCard";

interface MyTasksSectionProps {
  title: string;
  subtitle: string;
  tasks: Task[];
  projectNameMap: Map<string, string>;
  emptyTitle: string;
  emptyText: string;
  onQuickEdit: (taskId: string) => void;
  tone?: "default" | "high" | "medium";
}

export function MyTasksSection({
  title,
  subtitle,
  tasks,
  projectNameMap,
  emptyTitle,
  emptyText,
  onQuickEdit,
  tone = "default",
}: MyTasksSectionProps) {
  return (
    <section className="tf-panel tf-noise rounded-[1.75rem] p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="tf-meta">Task view</p>
          <h2 className="mt-2 tf-heading text-2xl text-[rgb(var(--foreground))]">
            {title}
          </h2>
          <p className="mt-3 text-sm leading-7 text-[rgb(var(--muted-foreground))]">
            {subtitle}
          </p>
        </div>

        <span
          className={[
            "inline-flex w-fit rounded-full px-3 py-1.5 text-xs font-medium",
            tone === "high"
              ? "tf-status-high"
              : tone === "medium"
                ? "tf-status-medium"
                : "bg-black/[0.05] text-[rgb(var(--foreground))] dark:bg-white/[0.06]",
          ].join(" ")}
        >
          {tasks.length} task{tasks.length !== 1 ? "s" : ""}
        </span>
      </div>

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
          tasks.map((task) => (
            <MyTasksTaskCard
              key={task.id}
              task={task}
              projectName={
                projectNameMap.get(task.project_id) ?? "Unknown project"
              }
              onQuickEdit={onQuickEdit}
            />
          ))
        )}
      </div>
    </section>
  );
}
