"use client";

import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearFilters, setFilterPriority } from "@/store/slices/boardSlice";
import { TaskPriority } from "@/types";

const priorityOptions: Array<{
  label: string;
  value: TaskPriority | null;
  tone?: string;
}> = [
  { label: "All", value: null },
  { label: "Low", value: "low", tone: "tf-status-low" },
  { label: "Medium", value: "medium", tone: "tf-status-medium" },
  { label: "High", value: "high", tone: "tf-status-high" },
];

export function BoardFilters() {
  const dispatch = useAppDispatch();
  const filteredPriority = useAppSelector(
    (state) => state.board.filteredPriority,
  );

  return (
    <div className="flex w-full min-w-0 flex-col gap-3">
      <label className="tf-meta block">Priority filter</label>

      <div className="flex min-w-0 flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0 flex-1">
          <div className="tf-panel-soft grid grid-cols-2 gap-2 rounded-[1.2rem] p-2 sm:flex sm:flex-wrap">
            {priorityOptions.map((option) => {
              const isActive = filteredPriority === option.value;

              return (
                <button
                  key={option.label}
                  type="button"
                  onClick={() => dispatch(setFilterPriority(option.value))}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition-all duration-200",
                    isActive
                      ? option.tone
                        ? option.tone
                        : "bg-black/8 text-[rgb(var(--foreground))] ring-1 ring-black/8 dark:bg-white/10 dark:ring-white/10"
                      : "text-[rgb(var(--muted-foreground))] hover:bg-black/[0.05] hover:text-[rgb(var(--foreground))] dark:hover:bg-white/[0.05]",
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={() => dispatch(clearFilters())}
          className="tf-btn-secondary w-full px-4 py-3 text-sm font-medium sm:w-fit xl:shrink-0"
        >
          Clear filters
        </button>
      </div>
    </div>
  );
}
