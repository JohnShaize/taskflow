"use client";

import { GlassSelect } from "@/components/ui/GlassSelect";
import {
  MyTasksDueBucket,
  MyTasksSortBy,
  TaskPriority,
  TaskStatus,
} from "@/types";

interface MyTasksFiltersProps {
  projectValue: string;
  priorityValue: "all" | TaskPriority;
  statusValue: "all" | TaskStatus;
  dueBucketValue: MyTasksDueBucket;
  sortValue: MyTasksSortBy;
  projectOptions: Array<{
    label: string;
    value: string;
  }>;
  onProjectChange: (value: string) => void;
  onPriorityChange: (value: "all" | TaskPriority) => void;
  onStatusChange: (value: "all" | TaskStatus) => void;
  onDueBucketChange: (value: MyTasksDueBucket) => void;
  onSortChange: (value: MyTasksSortBy) => void;
  onClear: () => void;
  totalMatched: number;
}

const priorityOptions = [
  { label: "All priorities", value: "all" },
  { label: "High", value: "high" },
  { label: "Medium", value: "medium" },
  { label: "Low", value: "low" },
];

const statusOptions = [
  { label: "All statuses", value: "all" },
  { label: "Todo", value: "todo" },
  { label: "In Progress", value: "in_progress" },
  { label: "Done", value: "done" },
];

const dueBucketOptions = [
  { label: "All due buckets", value: "all" },
  { label: "Overdue", value: "overdue" },
  { label: "Due today", value: "today" },
  { label: "Due this week", value: "this_week" },
  { label: "No due date", value: "no_due_date" },
];

const sortOptions = [
  { label: "Due soon", value: "due_soon" },
  { label: "Recently updated", value: "recently_updated" },
  { label: "Priority", value: "priority" },
];

export function MyTasksFilters({
  projectValue,
  priorityValue,
  statusValue,
  dueBucketValue,
  sortValue,
  projectOptions,
  onProjectChange,
  onPriorityChange,
  onStatusChange,
  onDueBucketChange,
  onSortChange,
  onClear,
  totalMatched,
}: MyTasksFiltersProps) {
  return (
    <section className="tf-panel tf-noise rounded-[1.75rem] p-5 sm:p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="tf-meta">Task filters</p>
          <h2 className="mt-2 tf-heading text-2xl text-[rgb(var(--foreground))]">
            Refine your workspace
          </h2>
          <p className="mt-3 text-sm leading-7 text-[rgb(var(--muted-foreground))]">
            Narrow the view by project, priority, status, due bucket, and sort
            order.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="tf-panel-soft rounded-full px-4 py-3 text-sm text-[rgb(var(--foreground))]">
            {totalMatched} matched task{totalMatched !== 1 ? "s" : ""}
          </div>

          <button
            type="button"
            onClick={onClear}
            className="tf-btn-secondary px-4 py-3 text-sm font-medium"
          >
            Clear filters
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-5">
        <div>
          <label className="tf-meta mb-2 block">Project</label>
          <GlassSelect
            value={projectValue}
            onChange={(value: string) => onProjectChange(value)}
            options={projectOptions}
          />
        </div>

        <div>
          <label className="tf-meta mb-2 block">Priority</label>
          <GlassSelect
            value={priorityValue}
            onChange={(value: string) =>
              onPriorityChange(value as "all" | TaskPriority)
            }
            options={priorityOptions}
          />
        </div>

        <div>
          <label className="tf-meta mb-2 block">Status</label>
          <GlassSelect
            value={statusValue}
            onChange={(value: string) =>
              onStatusChange(value as "all" | TaskStatus)
            }
            options={statusOptions}
          />
        </div>

        <div>
          <label className="tf-meta mb-2 block">Due bucket</label>
          <GlassSelect
            value={dueBucketValue}
            onChange={(value: string) =>
              onDueBucketChange(value as MyTasksDueBucket)
            }
            options={dueBucketOptions}
          />
        </div>

        <div>
          <label className="tf-meta mb-2 block">Sort</label>
          <GlassSelect
            value={sortValue}
            onChange={(value: string) => onSortChange(value as MyTasksSortBy)}
            options={sortOptions}
          />
        </div>
      </div>
    </section>
  );
}
