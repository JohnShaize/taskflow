"use client";

import { useState } from "react";
import { GlassSelect } from "@/components/ui/GlassSelect";
import { useCreateTaskMutation } from "@/services/tasksApi";
import { TaskPriority } from "@/types";

interface DashboardQuickTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => Promise<void> | void;
  projectOptions: Array<{
    label: string;
    value: string;
  }>;
}

const priorityOptions = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
];

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

export function DashboardQuickTaskModal({
  isOpen,
  onClose,
  onCreated,
  projectOptions,
}: DashboardQuickTaskModalProps) {
  const [createTask, { isLoading }] = useCreateTaskMutation();

  const [projectId, setProjectId] = useState("");
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState<string | null>(null);

  const effectiveProjectId = projectId || projectOptions[0]?.value || "";

  function handleClose() {
    setError(null);
    onClose();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!effectiveProjectId) {
      setError("Please choose a project.");
      return;
    }

    try {
      await createTask({
        project_id: effectiveProjectId,
        title,
        priority,
        due_date: dueDate || undefined,
      }).unwrap();

      setTitle("");
      setPriority("medium");
      setDueDate("");
      await onCreated();
      onClose();
    } catch (err) {
      console.error("Quick task create error:", err);
      setError("Failed to create task. Please try again.");
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/65 px-4 py-6 backdrop-blur-md">
      <div className="w-full max-w-xl rounded-[1.9rem] border border-black/8 bg-white/[0.96] p-5 shadow-[0_28px_120px_rgba(15,23,42,0.18)] dark:border-white/10 dark:bg-black/[0.92] dark:shadow-[0_28px_120px_rgba(0,0,0,0.7)] sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="tf-meta">Quick action</p>
            <h2 className="mt-2 tf-heading text-2xl text-[rgb(var(--foreground))]">
              Create Task
            </h2>
            <p className="mt-3 text-sm leading-7 text-[rgb(var(--muted-foreground))]">
              Add a task quickly without opening a project board first.
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
            <label className="tf-meta mb-2 block">Project</label>
            <GlassSelect
              value={effectiveProjectId}
              onChange={(value: string) => setProjectId(value)}
              options={projectOptions}
            />
          </div>

          <div>
            <label className="tf-meta mb-2 block">Task title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="tf-input"
              placeholder="Prepare launch checklist"
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="tf-meta mb-2 block">Priority</label>
              <GlassSelect
                value={priority}
                onChange={(value: string) => setPriority(value as TaskPriority)}
                options={priorityOptions}
              />
            </div>

            <div>
              <label className="tf-meta mb-2 block">Due date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="tf-input"
              />
            </div>
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
              {isLoading ? "Creating..." : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
