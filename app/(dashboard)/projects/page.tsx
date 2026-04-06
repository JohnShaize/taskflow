"use client";

import { useMemo } from "react";
import { useGetProjectsQuery } from "@/services/projectsApi";
import { useAppDispatch } from "@/store/hooks";
import { openProjectModal } from "@/store/slices/uiSlice";
import { ProjectList } from "@/components/projects/ProjectList";
import { CreateProjectModal } from "@/components/projects/CreateProjectModal";

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

function SparkIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="m12 3 1.8 4.7L18.5 9l-4.7 1.8L12 15.5l-1.8-4.7L5.5 9l4.7-1.3L12 3Z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5v5l3.5 2" />
    </svg>
  );
}

export default function ProjectsPage() {
  const dispatch = useAppDispatch();

  const {
    data: projects = [],
    isLoading,
    isFetching,
  } = useGetProjectsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const describedProjects = useMemo(
    () =>
      projects.filter((project) => Boolean(project.description?.trim())).length,
    [projects],
  );

  const latestProjectDate = useMemo(() => {
    if (!projects.length) return "No projects yet";

    const latest = [...projects].sort(
      (a, b) =>
        new Date(b.updated_at || b.created_at).getTime() -
        new Date(a.updated_at || a.created_at).getTime(),
    )[0];

    return new Date(
      latest.updated_at || latest.created_at,
    ).toLocaleDateString();
  }, [projects]);

  return (
    <div className="space-y-6">
      <section className="tf-panel tf-noise rounded-[1.85rem] p-5 sm:p-6 lg:p-7">
        <div className="flex flex-col gap-6 2xl:grid 2xl:grid-cols-[minmax(0,1.15fr)_minmax(620px,0.85fr)] 2xl:items-start 2xl:gap-8">
          <div className="max-w-4xl">
            <p className="tf-meta">Workspace directory</p>

            <h1 className="mt-2 tf-heading text-3xl text-[rgb(var(--foreground))] sm:text-4xl">
              Projects
            </h1>

            <p className="mt-3 text-[15px] leading-7 text-[rgb(var(--muted-foreground))]">
              Organize your workspaces, launch new boards, and keep every active
              project in one clean overview.
            </p>

            <p className="mt-2 text-sm text-[rgb(var(--muted-foreground))]">
              Browse your existing projects or create a new one to start a fresh
              collaboration flow.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                data-testid="create-project-button"
                onClick={() => dispatch(openProjectModal())}
                className="inline-flex items-center justify-center rounded-[1rem] bg-[rgb(var(--foreground))] px-4 py-3 text-sm font-medium text-[rgb(var(--background))] transition-all duration-200 hover:opacity-92"
              >
                + New Project
              </button>

              <div className="tf-panel-soft inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm text-[rgb(var(--foreground))]">
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(74,222,128,0.5)]" />
                Live project index
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 2xl:w-full 2xl:gap-4">
            <div className="tf-panel-soft rounded-[1.4rem] p-4 lg:p-5 2xl:min-h-[150px]">
              <div className="flex items-center gap-3 2xl:h-full 2xl:flex-col 2xl:items-start 2xl:justify-between">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(var(--ring),0.16)] text-[rgb(var(--foreground))]">
                  <FolderIcon />
                </span>
                <div>
                  <p className="tf-meta">Total projects</p>
                  <p className="mt-2 text-3xl font-semibold text-[rgb(var(--foreground))]">
                    {projects.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="tf-panel-soft rounded-[1.4rem] p-4 lg:p-5 2xl:min-h-[150px]">
              <div className="flex items-center gap-3 2xl:h-full 2xl:flex-col 2xl:items-start 2xl:justify-between">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(var(--ring),0.16)] text-[rgb(var(--foreground))]">
                  <SparkIcon />
                </span>
                <div>
                  <p className="tf-meta">With descriptions</p>
                  <p className="mt-2 text-3xl font-semibold text-[rgb(var(--foreground))]">
                    {describedProjects}
                  </p>
                </div>
              </div>
            </div>

            <div className="tf-panel-soft rounded-[1.4rem] p-4 lg:p-5 2xl:min-h-[150px]">
              <div className="flex items-center gap-3 2xl:h-full 2xl:flex-col 2xl:items-start 2xl:justify-between">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(var(--ring),0.16)] text-[rgb(var(--foreground))]">
                  <ClockIcon />
                </span>
                <div>
                  <p className="tf-meta">Latest activity</p>
                  <p className="mt-2 text-xl font-semibold text-[rgb(var(--foreground))]">
                    {latestProjectDate}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="tf-panel tf-noise rounded-[1.85rem] p-5 sm:p-6">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="tf-meta">Project collection</p>
            <h2 className="mt-2 tf-heading text-2xl text-[rgb(var(--foreground))]">
              All Projects
            </h2>
            <p className="mt-2 text-sm leading-7 text-[rgb(var(--muted-foreground))]">
              Open a workspace, continue planning, or start something new.
            </p>
          </div>

          <div className="text-sm text-[rgb(var(--muted-foreground))]">
            {projects.length} project{projects.length !== 1 ? "s" : ""}
          </div>
        </div>

        {isLoading || isFetching ? (
          <div className="tf-panel-soft rounded-[1.35rem] p-6">
            <p className="text-sm text-[rgb(var(--muted-foreground))]">
              Loading projects...
            </p>
          </div>
        ) : (
          <ProjectList projects={projects} />
        )}
      </section>

      <CreateProjectModal />
    </div>
  );
}
