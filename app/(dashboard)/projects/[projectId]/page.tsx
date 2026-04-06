"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import {
  useGetProjectByIdQuery,
  useGetProjectActivityQuery,
} from "@/services/projectsApi";
import { useGetTasksByProjectQuery } from "@/services/tasksApi";
import { useAppDispatch } from "@/store/hooks";
import { setTasks } from "@/store/slices/boardSlice";
import { KanbanBoard } from "@/components/board/KanbanBoard";
import { ActivityFeed } from "@/components/projects/ActivityFeed";

function MembersIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M16 18a4 4 0 0 0-8 0" />
      <circle cx="12" cy="10" r="3" />
      <path d="M20 18a3.5 3.5 0 0 0-3-3.46M17 7.5a2.5 2.5 0 1 1 0 5" />
      <path d="M4 18a3.5 3.5 0 0 1 3-3.46M7 7.5a2.5 2.5 0 1 0 0 5" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="12" cy="12" r="3.2" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .7 1.7 1.7 0 0 1-2.92 0 1.7 1.7 0 0 0-1-.7 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.7-1 1.7 1.7 0 0 1 0-2.92 1.7 1.7 0 0 0 .7-1 1.7 1.7 0 0 0-.34-1.87l-.06-.06A2 2 0 1 1 7.03 5.3l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.7 1.7 1.7 0 0 1 2.92 0 1.7 1.7 0 0 0 1 .7 1.7 1.7 0 0 0 1.87-.34l.06-.06A2 2 0 0 1 18.68 7l-.06.06A1.7 1.7 0 0 0 19.4 9a1.7 1.7 0 0 0 .7 1 1.7 1.7 0 0 1 0 2.92 1.7 1.7 0 0 0-.7 1Z" />
    </svg>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="tf-panel-soft rounded-[1.35rem] px-4 py-4">
      <p className="tf-meta">{label}</p>
      <p className="mt-3 tf-heading text-3xl text-[rgb(var(--foreground))]">
        {value}
      </p>
    </div>
  );
}

export default function ProjectDetailsPage() {
  const params = useParams<{ projectId: string }>();
  const projectId = params.projectId;
  const dispatch = useAppDispatch();
  const supabase = useMemo(() => createClient(), []);

  const {
    data: project,
    isLoading: isProjectLoading,
    error: projectError,
    refetch: refetchProject,
  } = useGetProjectByIdQuery(projectId, {
    skip: !projectId,
    refetchOnMountOrArgChange: true,
  });

  const {
    data: tasks,
    isLoading: isTasksLoading,
    error: tasksError,
    refetch: refetchTasks,
  } = useGetTasksByProjectQuery(projectId, {
    skip: !projectId,
    refetchOnMountOrArgChange: true,
  });

  const { data: activity = [], refetch: refetchActivity } =
    useGetProjectActivityQuery(projectId, {
      skip: !projectId,
      refetchOnMountOrArgChange: true,
    });

  useEffect(() => {
    if (tasks) {
      dispatch(setTasks(tasks));
    } else {
      dispatch(setTasks([]));
    }
  }, [tasks, dispatch, projectId]);

  useEffect(() => {
    if (!projectId) return;

    const channel = supabase
      .channel(`project-board-${projectId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasks",
          filter: `project_id=eq.${projectId}`,
        },
        async () => {
          await refetchTasks();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "projects",
          filter: `id=eq.${projectId}`,
        },
        async () => {
          await refetchProject();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "project_activity",
          filter: `project_id=eq.${projectId}`,
        },
        async () => {
          await refetchActivity();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [projectId, refetchProject, refetchTasks, refetchActivity, supabase]);

  if (isProjectLoading || isTasksLoading) {
    return <div className="tf-subtle">Loading project board...</div>;
  }

  if (projectError || !project) {
    return (
      <div className="rounded-[1.5rem] border border-red-500/20 bg-red-500/10 p-6 text-red-300">
        Failed to load project.
      </div>
    );
  }

  if (tasksError) {
    return (
      <div className="rounded-[1.5rem] border border-red-500/20 bg-red-500/10 p-6 text-red-300">
        Failed to load tasks.
      </div>
    );
  }

  const todoCount = tasks?.filter((task) => task.status === "todo").length ?? 0;
  const progressCount =
    tasks?.filter((task) => task.status === "in_progress").length ?? 0;
  const doneCount = tasks?.filter((task) => task.status === "done").length ?? 0;

  return (
    <div className="w-full min-w-0 space-y-6 sm:space-y-8">
      <motion.section
        initial={{ opacity: 0, y: 16, filter: "blur(14px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.48, ease: "easeOut" }}
        className="tf-panel tf-noise w-full min-w-0 overflow-hidden rounded-[2rem] p-4 sm:p-6 lg:p-7"
      >
        <div className="flex flex-col gap-5">
          <div className="max-w-full">
            <p className="tf-meta">Project board</p>
            <h1 className="mt-3 break-words tf-heading text-4xl text-[rgb(var(--foreground))] sm:text-4xl lg:text-5xl">
              {project.name}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-[rgb(var(--muted-foreground))]">
              {project.description || "No description added yet."}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Link
              href={`/projects/${projectId}/members`}
              className="tf-btn-secondary inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium"
            >
              <MembersIcon />
              Members
            </Link>

            <Link
              href={`/projects/${projectId}/settings`}
              className="tf-btn-secondary inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium"
            >
              <SettingsIcon />
              Settings
            </Link>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <MetricCard label="Total tasks" value={tasks?.length ?? 0} />
          <MetricCard label="Todo" value={todoCount} />
          <MetricCard label="In progress" value={progressCount} />
          <MetricCard label="Done" value={doneCount} />
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 22, filter: "blur(14px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.52, delay: 0.06, ease: "easeOut" }}
        className={cn("w-full min-w-0 space-y-6 sm:space-y-8")}
      >
        <KanbanBoard projectId={projectId} />

        <div className="mt-6 sm:mt-8">
          <ActivityFeed activity={activity} />
        </div>
      </motion.section>
    </div>
  );
}
