"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  useDeleteProjectMutation,
  useGetProjectByIdQuery,
  useGetProjectMembersQuery,
  useUpdateProjectMutation,
} from "@/services/projectsApi";
import { useAppSelector } from "@/store/hooks";

function BackIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="12" cy="12" r="3.2" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .7 1.7 1.7 0 0 1-2.92 0 1.7 1.7 0 0 0-1-.7 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.7-1 1.7 1.7 0 0 1 0-2.92 1.7 1.7 0 0 0 .7-1 1.7 1.7 0 0 0-.34-1.87l-.06-.06A2 2 0 1 1 7.03 5.3l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.7 1.7 1.7 0 0 1 2.92 0 1.7 1.7 0 0 0 1 .7 1.7 1.7 0 0 0 1.87-.34l.06-.06A2 2 0 0 1 18.68 7l-.06.06A1.7 1.7 0 0 0 19.4 9a1.7 1.7 0 0 0 .7 1 1.7 1.7 0 0 1 0 2.92 1.7 1.7 0 0 0-.7 1Z" />
    </svg>
  );
}

function DangerIcon() {
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

function LockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <rect x="4" y="11" width="16" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 1 1 8 0v3" />
    </svg>
  );
}

export default function ProjectSettingsPage() {
  const params = useParams<{ projectId: string }>();
  const router = useRouter();
  const projectId = params.projectId;
  const currentUser = useAppSelector((state) => state.auth.user);

  const {
    data: project,
    isLoading,
    isFetching,
    error,
  } = useGetProjectByIdQuery(projectId, {
    skip: !projectId,
    refetchOnMountOrArgChange: true,
  });

  const { data: members = [], isLoading: isMembersLoading } =
    useGetProjectMembersQuery(projectId, {
      skip: !projectId,
      refetchOnMountOrArgChange: true,
    });

  const [updateProject, { isLoading: isUpdating }] = useUpdateProjectMutation();
  const [deleteProject, { isLoading: isDeleting }] = useDeleteProjectMutation();

  const [draft, setDraft] = useState<{
    name: string;
    description: string;
  } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  const [message, setMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const initialLoading =
    (isLoading && !project) || (isMembersLoading && !project);
  const isRefreshing = isFetching && !!project;

  const currentMembership = useMemo(() => {
    if (!currentUser) return null;
    return members.find((member) => member.user_id === currentUser.id) ?? null;
  }, [members, currentUser]);

  const canManageProject = useMemo(() => {
    if (!project || !currentUser) return false;

    if (project.owner_id === currentUser.id) return true;
    return currentMembership?.role === "admin";
  }, [project, currentUser, currentMembership]);

  const currentName = draft?.name ?? project?.name ?? "";
  const currentDescription = draft?.description ?? project?.description ?? "";

  const hasChanges = useMemo(() => {
    if (!project) return false;

    return (
      currentName.trim() !== project.name ||
      currentDescription.trim() !== (project.description ?? "")
    );
  }, [currentName, currentDescription, project]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!project || !canManageProject) return;

    setFormError(null);
    setMessage(null);

    const trimmedName = currentName.trim();
    const trimmedDescription = currentDescription.trim();

    if (!trimmedName) {
      setFormError("Project name is required.");
      return;
    }

    try {
      await updateProject({
        projectId,
        name: trimmedName,
        description: trimmedDescription || null,
      }).unwrap();

      setDraft({
        name: trimmedName,
        description: trimmedDescription,
      });
      setMessage("Project settings updated successfully.");
    } catch (err) {
      console.error("Project update error:", err);
      setFormError("Failed to update project settings.");
    }
  }

  async function handleDelete() {
    if (!project || !canManageProject) return;

    setFormError(null);
    setMessage(null);

    if (deleteConfirm.trim() !== project.name) {
      setFormError("Type the exact project name to confirm deletion.");
      return;
    }

    try {
      await deleteProject(projectId).unwrap();
      router.push("/projects");
      router.refresh();
    } catch (err) {
      console.error("Project delete error:", err);
      setFormError("Failed to delete project.");
    }
  }

  if (initialLoading) {
    return (
      <div className="space-y-6">
        <section className="tf-panel tf-noise rounded-[1.85rem] p-6">
          <p className="tf-meta">Project settings</p>
          <h1 className="mt-2 tf-heading text-3xl text-[rgb(var(--foreground))] sm:text-4xl">
            Loading project settings...
          </h1>
          <p className="mt-4 text-sm text-[rgb(var(--muted-foreground))]">
            Preparing your project configuration workspace.
          </p>
        </section>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="rounded-[1.5rem] border border-red-500/20 bg-red-500/10 p-6 text-red-300">
        Failed to load project settings.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="tf-panel tf-noise rounded-[1.85rem] p-5 sm:p-6 lg:p-7">
        <div className="flex flex-col gap-6 2xl:grid 2xl:grid-cols-[minmax(0,1.12fr)_minmax(560px,0.88fr)] 2xl:items-start 2xl:gap-8">
          <div className="max-w-4xl">
            <div className="flex flex-wrap gap-3">
              <Link
                href={`/projects/${projectId}`}
                className="tf-btn-secondary inline-flex items-center gap-2 px-4 py-3 text-sm font-medium"
              >
                <BackIcon />
                Back to board
              </Link>

              {isRefreshing && (
                <div className="tf-panel-soft inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm text-[rgb(var(--muted-foreground))]">
                  <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  Refreshing
                </div>
              )}

              <div className="tf-panel-soft inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm text-[rgb(var(--foreground))]">
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                {canManageProject ? "Admin access" : "Member access"}
              </div>
            </div>

            <p className="mt-5 tf-meta">Project settings</p>
            <h1 className="mt-2 tf-heading text-3xl text-[rgb(var(--foreground))] sm:text-4xl">
              {project.name}
            </h1>
            <p className="mt-3 text-[15px] leading-7 text-[rgb(var(--muted-foreground))]">
              {canManageProject
                ? "Update the project name, description, and workspace details for this project only."
                : "You can view project information here, but only project admins can edit or delete this project."}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-2 2xl:gap-4">
            <div className="tf-panel-soft rounded-[1.4rem] p-4 lg:p-5">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(var(--ring),0.16)] text-[rgb(var(--foreground))]">
                  <SettingsIcon />
                </span>

                <div>
                  <p className="tf-meta">Project name</p>
                  <p className="mt-2 text-sm font-medium text-[rgb(var(--foreground))]">
                    {project.name}
                  </p>
                </div>
              </div>
            </div>

            <div className="tf-panel-soft rounded-[1.4rem] p-4 lg:p-5">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(var(--ring),0.16)] text-[rgb(var(--foreground))]">
                  {canManageProject ? <DangerIcon /> : <LockIcon />}
                </span>

                <div>
                  <p className="tf-meta">
                    {canManageProject ? "Created" : "Access"}
                  </p>
                  <p className="mt-2 text-sm font-medium text-[rgb(var(--foreground))]">
                    {canManageProject
                      ? new Date(project.created_at).toLocaleDateString()
                      : "Read only"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {!canManageProject && (
        <section className="tf-panel tf-noise rounded-[1.75rem] p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-300">
              <LockIcon />
            </span>

            <div>
              <p className="tf-meta">Permission notice</p>
              <h2 className="mt-1 text-lg font-semibold text-[rgb(var(--foreground))]">
                Member access only
              </h2>
            </div>
          </div>

          <p className="mt-4 text-sm leading-7 text-[rgb(var(--muted-foreground))]">
            You are a member of this project, so you can view project
            information, but only project admins can rename or delete the
            workspace.
          </p>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="tf-panel-soft rounded-[1.35rem] p-4">
              <p className="tf-meta">Project name</p>
              <p className="mt-2 text-base font-medium text-[rgb(var(--foreground))]">
                {project.name}
              </p>
            </div>

            <div className="tf-panel-soft rounded-[1.35rem] p-4">
              <p className="tf-meta">Description</p>
              <p className="mt-2 text-sm leading-7 text-[rgb(var(--muted-foreground))]">
                {project.description || "No description added yet."}
              </p>
            </div>
          </div>
        </section>
      )}

      {canManageProject && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          <section className="tf-panel tf-noise rounded-[1.75rem] p-5 sm:p-6">
            <p className="tf-meta">General</p>
            <h2 className="mt-2 tf-heading text-2xl text-[rgb(var(--foreground))]">
              Edit project details
            </h2>
            <p className="mt-3 text-sm leading-7 text-[rgb(var(--muted-foreground))]">
              Keep the workspace clear and recognizable for your team.
            </p>

            <form onSubmit={handleSave} className="mt-6 space-y-5">
              <div>
                <label className="tf-meta mb-2 block">Project name</label>
                <input
                  type="text"
                  value={currentName}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      name: e.target.value,
                      description:
                        prev?.description ?? project.description ?? "",
                    }))
                  }
                  className="tf-input"
                  placeholder="Project name"
                  required
                />
              </div>

              <div>
                <label className="tf-meta mb-2 block">Description</label>
                <textarea
                  value={currentDescription}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      name: prev?.name ?? project.name,
                      description: e.target.value,
                    }))
                  }
                  rows={5}
                  className="tf-input min-h-[150px] resize-none"
                  placeholder="What is this project about?"
                />
              </div>

              {formError && (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {formError}
                </div>
              )}

              {message && (
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                  {message}
                </div>
              )}

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <button
                  type="submit"
                  disabled={isUpdating || !hasChanges}
                  className="tf-btn-primary flex-1 px-4 py-3 text-sm font-medium disabled:opacity-50"
                >
                  {isUpdating ? "Saving..." : "Save changes"}
                </button>
              </div>
            </form>
          </section>

          <section className="tf-panel tf-noise rounded-[1.75rem] p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-red-500/15 text-red-300">
                <DangerIcon />
              </span>

              <div>
                <p className="tf-meta">Danger zone</p>
                <h2 className="mt-1 text-lg font-semibold text-[rgb(var(--foreground))]">
                  Delete project
                </h2>
              </div>
            </div>

            <p className="mt-4 text-sm leading-7 text-[rgb(var(--muted-foreground))]">
              This permanently deletes the project and its related workspace
              data. Type the exact project name to confirm.
            </p>

            <div className="mt-5 space-y-4">
              <div>
                <label className="tf-meta mb-2 block">
                  Confirm project name
                </label>
                <input
                  type="text"
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  className="tf-input"
                  placeholder={project.name}
                />
              </div>

              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="w-full rounded-[1rem] bg-red-500/15 px-4 py-3 text-sm font-medium text-red-300 transition-colors hover:bg-red-500/20 disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete project"}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
