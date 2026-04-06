"use client";

import { useMemo, useState } from "react";
import { ProjectActivity } from "@/types";

interface ActivityFeedProps {
  activity: ProjectActivity[];
}

const INITIAL_VISIBLE_COUNT = 10;

export function ActivityFeed({ activity }: ActivityFeedProps) {
  const [expanded, setExpanded] = useState(false);

  const visibleActivity = useMemo(() => {
    if (expanded) return activity;
    return activity.slice(0, INITIAL_VISIBLE_COUNT);
  }, [activity, expanded]);

  const shouldShowToggle = activity.length > INITIAL_VISIBLE_COUNT;

  return (
    <div className="tf-panel tf-noise rounded-[1.75rem] p-5">
      <h2 className="text-lg font-semibold text-[rgb(var(--foreground))]">
        Activity
      </h2>

      <p className="mt-1 text-sm text-[rgb(var(--muted-foreground))]">
        Recent project actions and team changes.
      </p>

      <div className="mt-5 space-y-3">
        {visibleActivity.length === 0 ? (
          <p className="text-sm text-[rgb(var(--muted-foreground))]">
            No activity yet.
          </p>
        ) : (
          visibleActivity.map((item) => (
            <div key={item.id} className="tf-panel-soft rounded-[1.25rem] p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
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
            </div>
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
              : `See more (${activity.length - INITIAL_VISIBLE_COUNT} more)`}
          </button>
        </div>
      )}
    </div>
  );
}
