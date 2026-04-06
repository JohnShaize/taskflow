"use client";

import { useMemo, useState } from "react";
import { useAppDispatch } from "@/store/hooks";
import { openProjectModal } from "@/store/slices/uiSlice";
import {
  useGetDashboardOverviewQuery,
  useGetProjectsQuery,
} from "@/services/projectsApi";
import { DashboardDateRange } from "@/types";
import { CreateProjectModal } from "@/components/projects/CreateProjectModal";
import { DashboardStatCard } from "@/components/dashboard/DashboardStatCard";
import { DashboardTaskList } from "@/components/dashboard/DashboardTaskList";
import { DashboardProjectSummaryGrid } from "@/components/dashboard/DashboardProjectSummaryGrid";
import { DashboardRecentComments } from "@/components/dashboard/DashboardRecentComments";
import { DashboardRecentActivity } from "@/components/dashboard/DashboardRecentActivity";
import { DashboardQuickTaskModal } from "@/components/dashboard/DashboardQuickTaskModal";
import { DashboardFilterBar } from "@/components/dashboard/DashboardFilterBar";
import { DashboardInsightCards } from "@/components/dashboard/DashboardInsightCards";
import { DashboardStatusDistributionChart } from "@/components/dashboard/DashboardStatusDistributionChart";
import { DashboardCompletionTrendChart } from "@/components/dashboard/DashboardCompletionTrendChart";
import { DashboardWorkloadPanel } from "@/components/dashboard/DashboardWorkloadPanel";

function FolderIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M3.5 7.5A2.5 2.5 0 0 1 6 5h4l2 2h6A2.5 2.5 0 0 1 20.5 9.5v7A2.5 2.5 0 0 1 18 19H6a2.5 2.5 0 0 1-2.5-2.5v-9Z" />
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

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="m5 12 4.2 4.2L19 6.5" />
    </svg>
  );
}

export default function DashboardPage() {
  const dispatch = useAppDispatch();

  const [isQuickTaskOpen, setIsQuickTaskOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState("all");
  const [range, setRange] = useState<DashboardDateRange>("30d");

  const {
    data: allProjects = [],
    isLoading: projectsLoading,
    isFetching: projectsFetching,
  } = useGetProjectsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const { data, isLoading, isFetching, error, refetch } =
    useGetDashboardOverviewQuery(
      {
        projectId: selectedProjectId === "all" ? undefined : selectedProjectId,
        range,
      },
      {
        refetchOnMountOrArgChange: true,
      },
    );

  const projectFilterOptions = useMemo(
    () => [
      { label: "All projects", value: "all" },
      ...allProjects.map((project) => ({
        label: project.name,
        value: project.id,
      })),
    ],
    [allProjects],
  );

  const quickTaskProjectOptions = useMemo(
    () =>
      allProjects.map((project) => ({
        label: project.name,
        value: project.id,
      })),
    [allProjects],
  );

  const initialLoading =
    (projectsLoading && allProjects.length === 0) || (isLoading && !data);

  const isRefreshing = isFetching || projectsFetching;

  if (initialLoading) {
    return (
      <div className="space-y-6">
        <section className="tf-panel tf-noise rounded-[1.85rem] p-6">
          <p className="tf-meta">Workspace command center</p>
          <h1 className="mt-2 tf-heading text-3xl text-[rgb(var(--foreground))] sm:text-4xl">
            Dashboard
          </h1>
          <p className="mt-4 text-sm text-[rgb(var(--muted-foreground))]">
            Loading your workspace overview...
          </p>
        </section>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-red-300">
        Failed to load dashboard.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="tf-panel tf-noise rounded-[1.85rem] p-5 sm:p-6 lg:p-7">
        <div className="flex flex-col gap-6 2xl:grid 2xl:grid-cols-[minmax(0,1.1fr)_minmax(540px,0.9fr)] 2xl:items-start 2xl:gap-8">
          <div className="max-w-4xl">
            <p className="tf-meta">Workspace command center</p>

            <h1 className="mt-2 tf-heading text-3xl text-[rgb(var(--foreground))] sm:text-4xl">
              Dashboard
            </h1>

            <p className="mt-3 text-[15px] leading-7 text-[rgb(var(--muted-foreground))]">
              See what needs attention today, track active work, and jump back
              into your most important projects quickly.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => dispatch(openProjectModal())}
                className="tf-btn-primary px-5 py-3 text-sm font-medium"
              >
                + Create Project
              </button>

              <button
                type="button"
                disabled={quickTaskProjectOptions.length === 0}
                onClick={() => setIsQuickTaskOpen(true)}
                className="tf-btn-secondary px-5 py-3 text-sm font-medium disabled:opacity-50"
              >
                + Quick Task
              </button>

              <div className="tf-panel-soft inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm text-[rgb(var(--foreground))]">
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(74,222,128,0.5)]" />
                Live workspace overview
              </div>

              {isRefreshing && (
                <div className="tf-panel-soft inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm text-[rgb(var(--muted-foreground))]">
                  <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  Refreshing
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-2 2xl:gap-4">
            <DashboardStatCard
              label="Total projects"
              value={data.totalProjects}
              icon={<FolderIcon />}
            />
            <DashboardStatCard
              label="Overdue tasks"
              value={data.overdueTasks}
              icon={<AlertIcon />}
              accent="high"
            />
            <DashboardStatCard
              label="Due today"
              value={data.dueToday}
              icon={<CalendarIcon />}
              accent="medium"
            />
            <DashboardStatCard
              label="Completed this week"
              value={data.completedThisWeek}
              icon={<CheckIcon />}
              accent="low"
            />
          </div>
        </div>
      </section>

      <DashboardFilterBar
        projectValue={selectedProjectId}
        rangeValue={range}
        projectOptions={projectFilterOptions}
        onProjectChange={setSelectedProjectId}
        onRangeChange={setRange}
      />

      <div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <DashboardTaskList
          title="Assigned to me"
          subtitle="Tasks currently assigned to you and still in progress."
          tasks={data.assignedToMeTasks}
          emptyTitle="No assigned tasks"
          emptyText="You have no open assigned tasks right now."
        />

        <DashboardTaskList
          title="Tasks I created"
          subtitle="Recently updated tasks created by you."
          tasks={data.createdByMeTasks}
          emptyTitle="No tasks created yet"
          emptyText="Create a task from a project board or from quick task."
        />
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <DashboardTaskList
          title="Upcoming deadlines"
          subtitle="The next due tasks across your active projects."
          tasks={data.upcomingDeadlines}
          emptyTitle="No upcoming deadlines"
          emptyText="Nothing scheduled yet. Add due dates to keep momentum visible."
          showDueDate
        />

        <DashboardRecentComments comments={data.recentCommentsOnMyTasks} />
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <DashboardStatusDistributionChart
          distribution={data.statusDistribution}
        />

        <DashboardCompletionTrendChart
          data={data.completionTrend}
          range={range}
        />
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <DashboardWorkloadPanel members={data.workloadByMember} range={range} />

        <DashboardInsightCards
          mostActiveProject={data.mostActiveProject}
          leastActiveProject={data.leastActiveProject}
          mostOverdueProject={data.mostOverdueProject}
        />
      </div>

      <DashboardProjectSummaryGrid summaries={data.projectSummaries} />

      <div className="grid min-w-0 grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <DashboardRecentActivity activity={data.recentActivity} />
      </div>

      <CreateProjectModal />

      <DashboardQuickTaskModal
        isOpen={isQuickTaskOpen}
        onClose={() => setIsQuickTaskOpen(false)}
        projectOptions={quickTaskProjectOptions}
        onCreated={async () => {
          await refetch();
        }}
      />
    </div>
  );
}
