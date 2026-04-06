"use client";

import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { closeProjectModal } from "@/store/slices/uiSlice";
import { useCreateProjectMutation } from "@/services/projectsApi";

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function CreateProjectModal() {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.ui.isProjectModalOpen);
  const [createProject, { isLoading }] = useCreateProjectMutation();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      await createProject({ name, description }).unwrap();
      setName("");
      setDescription("");
      dispatch(closeProjectModal());
    } catch {
      setError("Failed to create project. Please try again.");
    }
  }

  function handleClose() {
    setError(null);
    dispatch(closeProjectModal());
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/65 px-4 py-6 backdrop-blur-md">
      <div className="w-full max-w-2xl rounded-[1.9rem] border border-black/8 bg-white/[0.96] p-5 shadow-[0_28px_120px_rgba(15,23,42,0.18)] dark:border-white/10 dark:bg-black/[0.92] dark:shadow-[0_28px_120px_rgba(0,0,0,0.7)] sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="tf-meta">New workspace</p>
            <h2 className="mt-2 tf-heading text-2xl text-[rgb(var(--foreground))]">
              Create Project
            </h2>
            <p className="mt-3 text-sm leading-7 text-[rgb(var(--muted-foreground))]">
              Start a new project workspace with a title and optional
              description.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-black/[0.04] text-[rgb(var(--muted-foreground))] transition-colors hover:text-[rgb(var(--foreground))] dark:bg-white/[0.04]"
            aria-label="Close modal"
          >
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label className="tf-meta mb-2 block">Project name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="tf-input"
              placeholder="My awesome project"
            />
          </div>

          <div>
            <label className="tf-meta mb-2 block">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="tf-input min-h-[150px] resize-none"
              placeholder="What is this project about?"
            />
          </div>

          {error && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <button
              type="button"
              onClick={handleClose}
              className="tf-btn-secondary flex-1 px-4 py-3 text-sm font-medium"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="tf-btn-primary flex-1 px-4 py-3 text-sm font-medium disabled:opacity-50"
            >
              {isLoading ? "Creating..." : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
