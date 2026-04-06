"use client";

import { useEffect, useSyncExternalStore, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { closeTaskModal } from "@/store/slices/uiSlice";
import { useGetProjectMembersQuery } from "@/services/projectsApi";
import {
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useGetTaskCommentsQuery,
  useCreateTaskCommentMutation,
} from "@/services/tasksApi";
import { Task, TaskPriority, TaskStatus } from "@/types";
import { GlassSelect } from "@/components/ui/GlassSelect";

interface TaskModalProps {
  projectId: string;
}

interface TaskModalContentProps {
  projectId: string;
  editingTask: Task | undefined;
  editingTaskId: string | null;
  onClose: () => void;
}

const priorityOptions = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
];

const statusOptions = [
  { label: "Todo", value: "todo" },
  { label: "In Progress", value: "in_progress" },
  { label: "Done", value: "done" },
];

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

function TaskModalContent({
  projectId,
  editingTask,
  editingTaskId,
  onClose,
}: TaskModalContentProps) {
  const { data: members = [] } = useGetProjectMembersQuery(projectId);

  const { data: comments = [], isLoading: isCommentsLoading } =
    useGetTaskCommentsQuery(editingTaskId ?? "", {
      skip: !editingTaskId,
    });

  const [createTask, { isLoading: isCreating }] = useCreateTaskMutation();
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();
  const [deleteTask, { isLoading: isDeleting }] = useDeleteTaskMutation();
  const [createTaskComment, { isLoading: isCommenting }] =
    useCreateTaskCommentMutation();

  const [title, setTitle] = useState(() => editingTask?.title ?? "");
  const [description, setDescription] = useState(
    () => editingTask?.description ?? "",
  );
  const [priority, setPriority] = useState<TaskPriority>(
    () => editingTask?.priority ?? "medium",
  );
  const [status, setStatus] = useState<TaskStatus>(
    () => editingTask?.status ?? "todo",
  );
  const [dueDate, setDueDate] = useState(() => editingTask?.due_date ?? "");
  const [assigneeId, setAssigneeId] = useState(
    () => editingTask?.assignee_id ?? "",
  );
  const [commentText, setCommentText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [commentError, setCommentError] = useState<string | null>(null);

  const isLoading = isCreating || isUpdating;

  const assigneeOptions = [
    { label: "Unassigned", value: "" },
    ...members.map((member) => ({
      label: member.profile.full_name || member.profile.email,
      value: member.user_id,
    })),
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    try {
      if (editingTask) {
        await updateTask({
          id: editingTask.id,
          title,
          description: description || null,
          priority,
          status,
          due_date: dueDate || null,
          assignee_id: assigneeId || null,
          position: editingTask.position,
        }).unwrap();
      } else {
        await createTask({
          project_id: projectId,
          title,
          description: description || undefined,
          priority,
          due_date: dueDate || undefined,
          assignee_id: assigneeId || undefined,
        }).unwrap();
      }

      onClose();
    } catch (err) {
      console.error("Task modal submit error:", err);
      setError("Failed to save task. Please try again.");
    }
  }

  async function handleDeleteTask() {
    if (!editingTask) return;

    const confirmed = window.confirm(
      `Delete "${editingTask.title}"? This action cannot be undone.`,
    );

    if (!confirmed) return;

    setError(null);

    try {
      await deleteTask(editingTask.id).unwrap();
      onClose();
    } catch (err) {
      console.error("Delete task error:", err);
      setError("Failed to delete task. Please try again.");
    }
  }

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    setCommentError(null);

    if (!editingTaskId) return;

    try {
      await createTaskComment({
        taskId: editingTaskId,
        content: commentText,
      }).unwrap();

      setCommentText("");
    } catch (err) {
      console.error("Create comment error:", err);
      setCommentError("Failed to add comment.");
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-3 backdrop-blur-xl sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98, filter: "blur(12px)" }}
        animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: 14, scale: 0.98, filter: "blur(10px)" }}
        transition={{ type: "spring", stiffness: 220, damping: 24 }}
        onClick={(e) => e.stopPropagation()}
        className="tf-scrollbar relative max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-[2rem] border border-black/8 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.08),transparent_28%),radial-gradient(circle_at_top_left,rgba(99,102,241,0.10),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.72),rgba(255,255,255,0.64))] p-4 shadow-[0_24px_80px_rgba(15,23,42,0.22)] dark:border-white/10 dark:bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.08),transparent_28%),radial-gradient(circle_at_top_left,rgba(99,102,241,0.12),transparent_26%),linear-gradient(180deg,rgba(5,8,18,0.88),rgba(2,4,12,0.94))] dark:shadow-[0_30px_100px_rgba(0,0,0,0.62)] sm:p-6"
      >
        <div className="pointer-events-none absolute inset-0 rounded-[2rem] border border-white/10 opacity-60 dark:border-white/8" />
        <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent dark:via-white/10" />

        <div className="relative mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="tf-meta">
              {editingTask ? "Edit task" : "Create task"}
            </p>
            <h2 className="mt-2 tf-heading text-2xl text-[rgb(var(--foreground))] sm:text-3xl">
              {editingTask ? "Task Details" : "New Task"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="tf-btn-secondary inline-flex h-11 w-11 items-center justify-center p-0 text-lg"
          >
            ✕
          </button>
        </div>

        <div className="relative grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.95fr]">
          <div className="tf-panel-soft rounded-[1.6rem] p-4 sm:p-5">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="tf-meta mb-2 block">Title</label>
                <input
                  data-testid="task-title-input"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="tf-input"
                  placeholder="Enter task title"
                />
              </div>

              <div>
                <label className="tf-meta mb-2 block">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  className="tf-textarea"
                  placeholder="Add a task description"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="tf-meta mb-2 block">Priority</label>
                  <GlassSelect
                    value={priority}
                    onChange={(value) => setPriority(value as TaskPriority)}
                    options={priorityOptions}
                  />
                </div>

                <div>
                  <label className="tf-meta mb-2 block">Status</label>
                  <GlassSelect
                    value={status}
                    onChange={(value) => setStatus(value as TaskStatus)}
                    options={statusOptions}
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

                <div>
                  <label className="tf-meta mb-2 block">Assignee</label>
                  <GlassSelect
                    value={assigneeId}
                    onChange={setAssigneeId}
                    options={assigneeOptions}
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-3 pt-2">
                {editingTask && (
                  <button
                    type="button"
                    onClick={handleDeleteTask}
                    disabled={isDeleting}
                    className="w-full rounded-[1rem] border border-red-500/20 bg-red-500/12 px-4 py-3 text-sm font-medium text-red-300 transition-colors hover:bg-red-500/18 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isDeleting ? "Deleting..." : "Delete Task"}
                  </button>
                )}

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={onClose}
                    className="tf-btn-secondary flex-1 px-4 py-3 text-sm font-medium"
                  >
                    Cancel
                  </button>

                  <button
                    data-testid="create-task-submit"
                    type="submit"
                    disabled={isLoading}
                    className="tf-btn-primary flex-1 px-4 py-3 text-sm font-medium disabled:opacity-50"
                  >
                    {isLoading
                      ? "Saving..."
                      : editingTask
                        ? "Save Changes"
                        : "Create Task"}
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div className="tf-panel-soft rounded-[1.6rem] p-4 sm:p-5">
            <div className="mb-4">
              <p className="tf-meta">Collaboration</p>
              <h3 className="mt-2 tf-heading text-xl text-[rgb(var(--foreground))]">
                Comments
              </h3>
            </div>

            {!editingTask ? (
              <div className="rounded-[1.3rem] border border-dashed border-black/8 p-5 text-sm text-[rgb(var(--muted-foreground))] dark:border-white/10">
                Create the task first, then you can add comments.
              </div>
            ) : (
              <>
                <form onSubmit={handleAddComment} className="space-y-3">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    rows={4}
                    className="tf-textarea"
                    placeholder="Write a comment..."
                  />

                  {commentError && (
                    <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                      {commentError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isCommenting}
                    className="tf-btn-primary px-4 py-3 text-sm font-medium disabled:opacity-50"
                  >
                    {isCommenting ? "Posting..." : "Add Comment"}
                  </button>
                </form>

                <div className="tf-scrollbar mt-5 max-h-[360px] space-y-3 overflow-y-auto pr-1">
                  {isCommentsLoading ? (
                    <p className="text-sm text-[rgb(var(--muted-foreground))]">
                      Loading comments...
                    </p>
                  ) : comments.length === 0 ? (
                    <p className="text-sm text-[rgb(var(--muted-foreground))]">
                      No comments yet.
                    </p>
                  ) : (
                    comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="tf-panel rounded-[1.25rem] p-4"
                      >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="text-sm font-medium text-[rgb(var(--foreground))]">
                              {comment.author?.full_name ||
                                comment.author?.email ||
                                "Unknown user"}
                            </p>
                            <p className="mt-1 tf-meta">
                              {new Date(comment.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <p className="mt-3 text-sm leading-7 text-[rgb(var(--muted-foreground))]">
                          {comment.content}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function TaskModal({ projectId }: TaskModalProps) {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.ui.isTaskModalOpen);
  const editingTaskId = useAppSelector((state) => state.ui.editingTaskId);
  const tasks = useAppSelector((state) => state.board.tasks);

  const editingTask = tasks.find((task) => task.id === editingTaskId);
  const isClient = useIsClient();

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  if (!isClient) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <TaskModalContent
          key={editingTask?.id ?? `new-${projectId}`}
          projectId={projectId}
          editingTask={editingTask}
          editingTaskId={editingTaskId}
          onClose={() => dispatch(closeTaskModal())}
        />
      )}
    </AnimatePresence>,
    document.body,
  );
}
