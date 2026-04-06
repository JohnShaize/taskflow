"use client";

import { useMemo, useState } from "react";
import { InboxItem } from "@/types";
import { InboxItemCard } from "./InboxItemCard";

interface InboxFeedProps {
  items: InboxItem[];
  onQuickEdit: (item: InboxItem) => void;
}

const INITIAL_VISIBLE_COUNT = 10;

export function InboxFeed({ items, onQuickEdit }: InboxFeedProps) {
  const [expanded, setExpanded] = useState(false);

  const visibleItems = useMemo(() => {
    if (expanded) return items;
    return items.slice(0, INITIAL_VISIBLE_COUNT);
  }, [items, expanded]);

  const shouldShowToggle = items.length > INITIAL_VISIBLE_COUNT;

  return (
    <section className="tf-panel tf-noise rounded-[1.75rem] p-5 sm:p-6">
      <div>
        <p className="tf-meta">Recent updates</p>
        <h2 className="mt-2 tf-heading text-2xl text-[rgb(var(--foreground))]">
          Activity stream
        </h2>
        <p className="mt-3 text-sm leading-7 text-[rgb(var(--muted-foreground))]">
          A live view of comments, assignments, and workspace changes across
          your project scope.
        </p>
      </div>

      <div className="mt-6 space-y-3">
        {visibleItems.length === 0 ? (
          <div className="tf-panel-soft rounded-[1.35rem] p-5">
            <p className="text-base font-medium text-[rgb(var(--foreground))]">
              No inbox items
            </p>
            <p className="mt-2 text-sm text-[rgb(var(--muted-foreground))]">
              New collaboration updates will appear here when activity happens.
            </p>
          </div>
        ) : (
          visibleItems.map((item) => (
            <InboxItemCard
              key={item.id}
              item={item}
              onQuickEdit={onQuickEdit}
            />
          ))
        )}
      </div>

      {shouldShowToggle && (
        <div className="mt-5 flex justify-center">
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="tf-btn-secondary w-full px-4 py-3 text-sm font-medium sm:w-fit"
          >
            {expanded
              ? "Show less"
              : `See more (${items.length - INITIAL_VISIBLE_COUNT} more)`}
          </button>
        </div>
      )}
    </section>
  );
}
