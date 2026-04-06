"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setTasks } from "@/store/slices/boardSlice";
import { openTaskModal } from "@/store/slices/uiSlice";
import { useGetProjectsQuery } from "@/services/projectsApi";
import { useGetMyTasksOverviewQuery } from "@/services/tasksApi";
import {
  MyTasksDueBucket,
  MyTasksSortBy,
  Task,
  TaskPriority,
  TaskStatus,
} from "@/types";
import { MyTasksFilters } from "@/components/tasks/MyTasksFilters";
import { MyTasksSection } from "@/components/tasks/MyTasksSection";
import { TaskModal } from "@/components/board/TaskModal";

function ClipboardIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <rect x="6" y="4" width="12" height="16" rx="2.5" />
      <path d="M9 4.5h6a1.5 1.5 0 0 0-1.5-1.5h-3A1.5 1.5 0 0 0 9 4.5Z" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
      <path d="M10.3 3.8 2.9 17a2 2 0 0 0 1.74 3h14.72A2 2 0 0 0 21.1 17L13.7 3.8a2 2 0 0 0-3.4 0Z" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M8 3v3M16 3v3M4 9h16" />
      <rect x="4" y="5" width="16" height="16" rx="2.5" />
    </svg>
  );
}

function CommentIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M7 17 3.5 20V6.5A2.5 2.5 0 0 1 6 4h12a2.5 2.5 0 0 1 2.5 2.5v8A2.5 2.5 0 0 1 18 17H7Z" />
    </svg>
  );
}

function StatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent?: "high" | "medium" | "low";
}) {
  return (
    <div className="tf-panel-soft rounded-[1.4rem] p-4 lg:p-5">
      <div className="flex items-center gap-3">
        <span
          className={[
            "inline-flex h-11 w-11 items-center justify-center rounded-2xl text-[rgb(var(--foreground))]",
            accent === "high"
              ? "tf-status-high"
              : accent === "medium"
                ? "tf-status-medium"
                : accent === "low"
                  ? "tf-status-low"
                  : "bg-[rgba(var(--ring),0.16)]",
          ].join(" ")}
        >
          {icon}
        </span>

        <div>
          <p className="tf-meta">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-[rgb(var(--foreground))]">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function getTodayString() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getEndOfWeekString() {
  const date = new Date();
  const day = date.getDay();
  const diff = 7 - day;
  date.setDate(date.getDate() + diff);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${d}`;
}

function matchesDueBucket(task: Task, dueBucket: MyTasksDueBucket) {
  if (dueBucket === "all") return true;

  const today = getTodayString();
  const endOfWeek = getEndOfWeekString();

  if (dueBucket === "overdue") {
    return (
      Boolean(task.due_date) && task.status !== "done" && task.due_date! < today
    );
  }

  if (dueBucket === "today") {
    return (
      Boolean(task.due_date) &&
      task.status !== "done" &&
      task.due_date === today
    );
  }

  if (dueBucket === "this_week") {
    return (
      Boolean(task.due_date) &&
      task.status !== "done" &&
      task.due_date! > today &&
      task.due_date! <= endOfWeek
    );
  }

  if (dueBucket === "no_due_date") {
    return !task.due_date;
  }

  return true;
}

function sortTasks(tasks: Task[], sortBy: MyTasksSortBy) {
  const priorityOrder: Record<TaskPriority, number> = {
    high: 0,
    medium: 1,
    low: 2,
  };

  return [...tasks].sort((a, b) => {
    if (sortBy === "recently_updated") {
      return (
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
    }

    if (sortBy === "priority") {
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }

      return (
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
    }

    if (!a.due_date && !b.due_date) {
      return (
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
    }

    if (!a.due_date) return 1;
    if (!b.due_date) return -1;

    if (a.due_date !== b.due_date) {
      return a.due_date.localeCompare(b.due_date);
    }

    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });
}

export default function MyTasksPage() {
  const dispatch = useAppDispatch();
  const editingTaskId = useAppSelector((state) => state.ui.editingTaskId);

  const [projectFilter, setProjectFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState<"all" | TaskPriority>(
    "all",
  );
  const [statusFilter, setStatusFilter] = useState<"all" | TaskStatus>("all");
  const [dueBucketFilter, setDueBucketFilter] =
    useState<MyTasksDueBucket>("all");
  const [sortBy, setSortBy] = useState<MyTasksSortBy>("due_soon");

  const {
    data: projects = [],
    isLoading: isProjectsLoading,
    isFetching: isProjectsFetching,
  } = useGetProjectsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const { data, isLoading, isFetching, error } = useGetMyTasksOverviewQuery(
    undefined,
    {
      refetchOnMountOrArgChange: true,
    },
  );

  useEffect(() => {
    dispatch(setTasks(data?.allTasks ?? []));
  }, [data, dispatch]);

  const projectNameMap = useMemo(() => {
    const map = new Map<string, string>();

    projects.forEach((project) => {
      map.set(project.id, project.name);
    });

    return map;
  }, [projects]);

  const projectOptions = useMemo(
    () => [
      { label: "All projects", value: "all" },
      ...projects.map((project) => ({
        label: project.name,
        value: project.id,
      })),
    ],
    [projects],
  );

  const activeTaskProjectId = useMemo(() => {
    return (
      data?.allTasks.find((task) => task.id === editingTaskId)?.project_id ?? ""
    );
  }, [data, editingTaskId]);

  function applyFilters(tasks: Task[]) {
    return sortTasks(
      tasks.filter((task) => {
        if (projectFilter !== "all" && task.project_id !== projectFilter) {
          return false;
        }

        if (priorityFilter !== "all" && task.priority !== priorityFilter) {
          return false;
        }

        if (statusFilter !== "all" && task.status !== statusFilter) {
          return false;
        }

        if (!matchesDueBucket(task, dueBucketFilter)) {
          return false;
        }

        return true;
      }),
      sortBy,
    );
  }

  function handleQuickEdit(taskId: string) {
    dispatch(openTaskModal(taskId));
  }

  function clearFilters() {
    setProjectFilter("all");
    setPriorityFilter("all");
    setStatusFilter("all");
    setDueBucketFilter("all");
    setSortBy("due_soon");
  }

  const initialLoading =
    (isLoading && !data) || (isProjectsLoading && projects.length === 0);

  const isRefreshing = isFetching || isProjectsFetching;

  if (initialLoading) {
    return (
      <div className="space-y-6">
        <section className="tf-panel tf-noise rounded-[1.85rem] p-6">
          <p className="tf-meta">Personal workspace</p>
          <h1 className="mt-2 tf-heading text-3xl text-[rgb(var(--foreground))] sm:text-4xl">
            My Tasks
          </h1>
          <p className="mt-4 text-sm text-[rgb(var(--muted-foreground))]">
            Loading your task workspace...
          </p>
        </section>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-red-300">
        Failed to load your tasks.
      </div>
    );
  }

  const matchedTasks = applyFilters(data.allTasks);
  const assignedToMe = applyFilters(data.assignedToMe);
  const overdue = applyFilters(data.overdue);
  const dueToday = applyFilters(data.dueToday);
  const dueThisWeek = applyFilters(data.dueThisWeek);
  const noDueDate = applyFilters(data.noDueDate);
  const createdByMe = applyFilters(data.createdByMe);
  const withRecentComments = applyFilters(data.withRecentComments);

  return (
    <div className="space-y-6">
      <section className="tf-panel tf-noise rounded-[1.85rem] p-5 sm:p-6 lg:p-7">
        <div className="flex flex-col gap-6 2xl:grid 2xl:grid-cols-[minmax(0,1.1fr)_minmax(560px,0.9fr)] 2xl:items-start 2xl:gap-8">
          <div className="max-w-4xl">
            <p className="tf-meta">Personal workspace</p>

            <h1 className="mt-2 tf-heading text-3xl text-[rgb(var(--foreground))] sm:text-4xl">
              My Tasks
            </h1>

            <p className="mt-3 text-[15px] leading-7 text-[rgb(var(--muted-foreground))]">
              Track everything assigned to you, created by you, and recently
              discussed across all your projects in one focused view.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <div className="tf-panel-soft inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm text-[rgb(var(--foreground))]">
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(74,222,128,0.5)]" />
                Personal task command center
              </div>

              <Link
                href="/projects"
                className="tf-btn-secondary px-5 py-3 text-sm font-medium"
              >
                Open projects
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
            <StatCard
              label="Assigned to me"
              value={data.assignedToMe.length}
              icon={<ClipboardIcon />}
            />
            <StatCard
              label="Overdue"
              value={data.overdue.length}
              icon={<AlertIcon />}
              accent="high"
            />
            <StatCard
              label="Due today"
              value={data.dueToday.length}
              icon={<CalendarIcon />}
              accent="medium"
            />
            <StatCard
              label="Recent comments"
              value={data.withRecentComments.length}
              icon={<CommentIcon />}
              accent="low"
            />
          </div>
        </div>
      </section>

      <MyTasksFilters
        projectValue={projectFilter}
        priorityValue={priorityFilter}
        statusValue={statusFilter}
        dueBucketValue={dueBucketFilter}
        sortValue={sortBy}
        projectOptions={projectOptions}
        onProjectChange={setProjectFilter}
        onPriorityChange={setPriorityFilter}
        onStatusChange={setStatusFilter}
        onDueBucketChange={setDueBucketFilter}
        onSortChange={setSortBy}
        onClear={clearFilters}
        totalMatched={matchedTasks.length}
      />

      <MyTasksSection
        title="Matching tasks"
        subtitle="All tasks matching your current filters and sort."
        tasks={matchedTasks}
        projectNameMap={projectNameMap}
        emptyTitle="No matching tasks"
        emptyText="Try changing one or more filters to widen the view."
        onQuickEdit={handleQuickEdit}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <MyTasksSection
          title="Assigned to me"
          subtitle="Tasks currently assigned to you."
          tasks={assignedToMe}
          projectNameMap={projectNameMap}
          emptyTitle="No assigned tasks"
          emptyText="Nothing is currently assigned to you."
          onQuickEdit={handleQuickEdit}
        />

        <MyTasksSection
          title="Tasks I created"
          subtitle="Tasks created by you across all projects."
          tasks={createdByMe}
          projectNameMap={projectNameMap}
          emptyTitle="No created tasks"
          emptyText="Tasks you create will appear here."
          onQuickEdit={handleQuickEdit}
        />

        <MyTasksSection
          title="Overdue"
          subtitle="Work that has already passed its due date."
          tasks={overdue}
          projectNameMap={projectNameMap}
          emptyTitle="No overdue tasks"
          emptyText="Everything is on track right now."
          onQuickEdit={handleQuickEdit}
          tone="high"
        />

        <MyTasksSection
          title="Due today"
          subtitle="Tasks that need attention before today ends."
          tasks={dueToday}
          projectNameMap={projectNameMap}
          emptyTitle="Nothing due today"
          emptyText="You have breathing room today."
          onQuickEdit={handleQuickEdit}
          tone="medium"
        />

        <MyTasksSection
          title="Due this week"
          subtitle="Upcoming work with deadlines in the current week."
          tasks={dueThisWeek}
          projectNameMap={projectNameMap}
          emptyTitle="Nothing due this week"
          emptyText="No active weekly deadlines right now."
          onQuickEdit={handleQuickEdit}
        />

        <MyTasksSection
          title="No due date"
          subtitle="Open tasks that still need scheduling."
          tasks={noDueDate}
          projectNameMap={projectNameMap}
          emptyTitle="No unscheduled tasks"
          emptyText="Everything open already has a due date."
          onQuickEdit={handleQuickEdit}
        />
      </div>

      <MyTasksSection
        title="Tasks with recent comments"
        subtitle="Tasks that have fresh discussion activity."
        tasks={withRecentComments}
        projectNameMap={projectNameMap}
        emptyTitle="No recent comments"
        emptyText="Comment activity on your task scope will appear here."
        onQuickEdit={handleQuickEdit}
      />

      <TaskModal projectId={activeTaskProjectId || projects[0]?.id || ""} />
    </div>
  );
}
