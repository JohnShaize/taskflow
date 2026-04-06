import Link from "next/link";
import { InboxItem } from "@/types";
import { cn } from "@/lib/utils";

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

interface InboxItemCardProps {
  item: InboxItem;
  onQuickEdit: (item: InboxItem) => void;
}

function getKindLabel(item: InboxItem) {
  if (item.kind === "comment") return "Comment";
  if (item.kind === "assignment") return "Assignment";
  if (item.kind === "member_event") return "Member event";
  return "Project event";
}

function getKindTone(item: InboxItem) {
  if (item.kind === "comment") return "tf-status-low";
  if (item.kind === "assignment") return "tf-status-medium";
  if (item.kind === "member_event") return "tf-status-high";
  return "bg-black/[0.05] text-[rgb(var(--foreground))] dark:bg-white/[0.06]";
}

export function InboxItemCard({ item, onQuickEdit }: InboxItemCardProps) {
  return (
    <div className="tf-panel-soft rounded-[1.35rem] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-black/10 dark:hover:border-white/10">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium",
                getKindTone(item),
              )}
            >
              {getKindLabel(item)}
            </span>

            {item.project_name && (
              <span className="rounded-full bg-black/[0.05] px-3 py-1.5 text-xs font-medium text-[rgb(var(--muted-foreground))] dark:bg-white/[0.06]">
                {item.project_name}
              </span>
            )}

            {item.priority && (
              <span
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium capitalize",
                  item.priority === "high"
                    ? "tf-status-high"
                    : item.priority === "medium"
                      ? "tf-status-medium"
                      : "tf-status-low",
                )}
              >
                {item.priority}
              </span>
            )}
          </div>

          <h3 className="mt-3 line-clamp-2 text-lg font-semibold tracking-[-0.03em] text-[rgb(var(--foreground))]">
            {item.title}
          </h3>

          <p className="mt-3 line-clamp-3 text-sm leading-7 text-[rgb(var(--muted-foreground))]">
            {item.description}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {item.actor_name && (
              <span className="rounded-full bg-black/[0.05] px-3 py-1.5 text-xs font-medium text-[rgb(var(--muted-foreground))] dark:bg-white/[0.06]">
                {item.actor_name}
              </span>
            )}

            {item.status && (
              <span className="rounded-full bg-black/[0.05] px-3 py-1.5 text-xs font-medium capitalize text-[rgb(var(--foreground))] dark:bg-white/[0.06]">
                {item.status.replace("_", " ")}
              </span>
            )}

            {item.task_title && item.kind !== "comment" && (
              <span className="rounded-full bg-black/[0.05] px-3 py-1.5 text-xs font-medium text-[rgb(var(--muted-foreground))] dark:bg-white/[0.06]">
                {item.task_title}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-start gap-3 lg:items-end">
          <div className="text-left lg:text-right">
            <p className="tf-meta">When</p>
            <p className="mt-2 text-sm font-medium text-[rgb(var(--muted-foreground))]">
              {new Date(item.created_at).toLocaleString()}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {item.task_id && (
              <button
                type="button"
                onClick={() => onQuickEdit(item)}
                className="tf-btn-secondary inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium"
              >
                <EditIcon />
                Quick edit
              </button>
            )}

            {item.project_id && (
              <Link
                href={`/projects/${item.project_id}`}
                className="tf-btn-primary inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium"
              >
                <ArrowUpRightIcon />
                Open board
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
