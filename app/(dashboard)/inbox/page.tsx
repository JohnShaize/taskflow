"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setTasks } from "@/store/slices/boardSlice";
import { openTaskModal } from "@/store/slices/uiSlice";
import { useGetInboxOverviewQuery } from "@/services/projectsApi";
import { InboxFilterKind, InboxItem } from "@/types";
import { InboxFilters } from "@/components/inbox/InboxFilters";
import { InboxFeed } from "@/components/inbox/InboxFeed";
import { TaskModal } from "@/components/board/TaskModal";

function InboxStatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="tf-panel-soft rounded-[1.4rem] p-4 lg:p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="tf-meta">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-[rgb(var(--foreground))]">
            {value}
          </p>
        </div>

        <span className="rounded-full bg-black/[0.05] px-3 py-1.5 text-xs font-medium text-[rgb(var(--foreground))] dark:bg-white/[0.06]">
          Live
        </span>
      </div>
    </div>
  );
}

export default function InboxPage() {
  const dispatch = useAppDispatch();
  const editingTaskId = useAppSelector((state) => state.ui.editingTaskId);

  const [filterKind, setFilterKind] = useState<InboxFilterKind>("all");

  const { data, isLoading, isFetching, error } = useGetInboxOverviewQuery(
    undefined,
    {
      refetchOnMountOrArgChange: true,
    },
  );

  useEffect(() => {
    dispatch(setTasks(data?.relatedTasks ?? []));
  }, [data, dispatch]);

  const filteredItems = useMemo(() => {
    if (!data) return [];

    if (filterKind === "all") {
      return data.items;
    }

    return data.items.filter((item) => {
      if (filterKind === "comments") return item.kind === "comment";
      if (filterKind === "assignments") return item.kind === "assignment";
      if (filterKind === "project_events") return item.kind === "project_event";
      if (filterKind === "member_events") return item.kind === "member_event";
      return true;
    });
  }, [data, filterKind]);

  const activeTaskProjectId = useMemo(() => {
    return (
      data?.relatedTasks.find((task) => task.id === editingTaskId)
        ?.project_id ?? ""
    );
  }, [data, editingTaskId]);

  const initialLoading = isLoading && !data;
  const isRefreshing = isFetching && !!data;

  function handleQuickEdit(item: InboxItem) {
    if (!item.task_id) return;
    dispatch(openTaskModal(item.task_id));
  }

  if (initialLoading) {
    return (
      <div className="space-y-6">
        <section className="tf-panel tf-noise rounded-[1.85rem] p-6">
          <p className="tf-meta">Workspace feed</p>
          <h1 className="mt-2 tf-heading text-3xl text-[rgb(var(--foreground))] sm:text-4xl">
            Inbox
          </h1>
          <p className="mt-4 text-sm text-[rgb(var(--muted-foreground))]">
            Loading your inbox...
          </p>
        </section>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-red-300">
        Failed to load inbox.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="tf-panel tf-noise rounded-[1.85rem] p-5 sm:p-6 lg:p-7">
        <div className="flex flex-col gap-6 2xl:grid 2xl:grid-cols-[minmax(0,1.08fr)_minmax(560px,0.92fr)] 2xl:items-start 2xl:gap-8">
          <div className="max-w-4xl">
            <p className="tf-meta">Workspace feed</p>

            <h1 className="mt-2 tf-heading text-3xl text-[rgb(var(--foreground))] sm:text-4xl">
              Inbox
            </h1>

            <p className="mt-3 text-[15px] leading-7 text-[rgb(var(--muted-foreground))]">
              Track comments, assignments, project changes, and member updates
              in one unified feed across your workspace.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <div className="tf-panel-soft inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm text-[rgb(var(--foreground))]">
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(74,222,128,0.5)]" />
                Collaboration stream
              </div>

              <Link
                href="/my-tasks"
                className="tf-btn-secondary px-5 py-3 text-sm font-medium"
              >
                Open my tasks
              </Link>

              {isRefreshing && (
                <div className="tf-panel-soft inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm text-[rgb(var(--muted-foreground))]">
                  <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  Refreshing
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-2 2xl:gap-4">
            <InboxStatCard label="All updates" value={data.counts.all} />
            <InboxStatCard label="Comments" value={data.counts.comments} />
            <InboxStatCard
              label="Assignments"
              value={data.counts.assignments}
            />
            <InboxStatCard
              label="Member events"
              value={data.counts.member_events}
            />
          </div>
        </div>
      </section>

      <InboxFilters
        activeFilter={filterKind}
        counts={data.counts}
        onChange={setFilterKind}
      />

      <InboxFeed items={filteredItems} onQuickEdit={handleQuickEdit} />

      <TaskModal
        projectId={
          activeTaskProjectId || data.relatedTasks[0]?.project_id || ""
        }
      />
    </div>
  );
}
