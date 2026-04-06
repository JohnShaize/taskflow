"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { cn } from "@/lib/utils";
import { Task, TaskStatus } from "@/types";
import { TaskCard } from "./TaskCard";

interface BoardColumnProps {
  title: string;
  status: TaskStatus;
  tasks: Task[];
}

const statusAccent: Record<TaskStatus, string> = {
  todo: "from-sky-400/20 to-cyan-400/5 dark:from-sky-400/10 dark:to-cyan-400/0",
  in_progress:
    "from-amber-400/20 to-orange-400/5 dark:from-amber-400/10 dark:to-orange-400/0",
  done: "from-emerald-400/20 to-lime-400/5 dark:from-emerald-400/10 dark:to-lime-400/0",
};

export function BoardColumn({ title, status, tasks }: BoardColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: {
      type: "column",
      status,
    },
  });

  return (
    <section
      className={cn(
        "tf-panel tf-noise rounded-[1.75rem] p-4 sm:p-5",
        isOver && "ring-1 ring-sky-400/40",
      )}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="tf-meta">{status.replace("_", " ")}</p>
          <h3 className="mt-1 tf-heading text-xl text-[rgb(var(--foreground))]">
            {title}
          </h3>
        </div>

        <div
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-medium text-[rgb(var(--foreground))]",
            "bg-gradient-to-br",
            statusAccent[status],
            "border-black/5 dark:border-white/10",
          )}
        >
          {tasks.length}
        </div>
      </div>

      <SortableContext
        items={tasks.map((task) => task.id)}
        strategy={verticalListSortingStrategy}
      >
        <div
          ref={setNodeRef}
          data-testid={`column-${status}`}
          className="tf-scrollbar min-h-[280px] space-y-3 rounded-[1.3rem]"
        >
          {tasks.length === 0 ? (
            <div className="tf-panel-soft flex min-h-[160px] items-center justify-center rounded-[1.35rem] border border-dashed border-black/8 p-5 text-center dark:border-white/10">
              <div>
                <p className="tf-meta">Drop zone</p>
                <p className="mt-2 text-sm text-[rgb(var(--muted-foreground))]">
                  No tasks yet
                </p>
              </div>
            </div>
          ) : (
            tasks.map((task) => <TaskCard key={task.id} task={task} />)
          )}
        </div>
      </SortableContext>
    </section>
  );
}
