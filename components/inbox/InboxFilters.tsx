"use client";

import { InboxFilterKind, InboxOverview } from "@/types";
import { cn } from "@/lib/utils";

interface InboxFiltersProps {
  activeFilter: InboxFilterKind;
  counts: InboxOverview["counts"];
  onChange: (value: InboxFilterKind) => void;
}

const filterOptions: Array<{
  label: string;
  value: InboxFilterKind;
}> = [
  { label: "All", value: "all" },
  { label: "Comments", value: "comments" },
  { label: "Assignments", value: "assignments" },
  { label: "Project events", value: "project_events" },
  { label: "Member events", value: "member_events" },
];

export function InboxFilters({
  activeFilter,
  counts,
  onChange,
}: InboxFiltersProps) {
  const countMap: Record<InboxFilterKind, number> = {
    all: counts.all,
    comments: counts.comments,
    assignments: counts.assignments,
    project_events: counts.project_events,
    member_events: counts.member_events,
  };

  return (
    <section className="tf-panel tf-noise rounded-[1.75rem] p-5 sm:p-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="tf-meta">Inbox filters</p>
          <h2 className="mt-2 tf-heading text-2xl text-[rgb(var(--foreground))]">
            Refine your feed
          </h2>
          <p className="mt-3 text-sm leading-7 text-[rgb(var(--muted-foreground))]">
            Focus the feed by collaboration type without leaving the page.
          </p>
        </div>

        <div className="tf-panel-soft grid grid-cols-2 gap-2 rounded-[1.2rem] p-2 sm:flex sm:flex-wrap">
          {filterOptions.map((option) => {
            const isActive = activeFilter === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange(option.value)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-all duration-200",
                  "outline-none ring-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0",
                  "text-[rgb(var(--muted-foreground))] bg-black/[0.05] hover:bg-black/[0.07] hover:text-[rgb(var(--foreground))]",
                  "dark:bg-white/[0.04] dark:hover:bg-white/[0.06]",
                  isActive &&
                    "bg-black/[0.08] text-[rgb(var(--foreground))] ring-1 ring-black/8 dark:bg-white/[0.08] dark:ring-white/10",
                )}
                style={{ WebkitTapHighlightColor: "transparent" }}
              >
                {option.label} ({countMap[option.value]})
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
