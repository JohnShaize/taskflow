"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { cn } from "@/lib/utils";
import { useAppDispatch } from "@/store/hooks";
import { openTaskModal } from "@/store/slices/uiSlice";
import { Task } from "@/types";

const priorityClasses = {
  low: "tf-status-low",
  medium: "tf-status-medium",
  high: "tf-status-high",
};

interface TaskCardProps {
  task: Task;
}

function DragHandleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <path d="M9 6h.01M9 12h.01M9 18h.01M15 6h.01M15 12h.01M15 18h.01" />
    </svg>
  );
}

export function TaskCard({ task }: TaskCardProps) {
  const dispatch = useAppDispatch();
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "task",
      task,
    },
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(pointer: coarse)");

    const handleChange = () => {
      setIsTouchDevice(mediaQuery.matches);
    };

    handleChange();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
    } else {
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  const style = useMemo(
    () => ({
      transform: CSS.Transform.toString(transform),
      transition,
    }),
    [transform, transition],
  );

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (isTouchDevice) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;

    const rotateY = (px - 0.5) * 8;
    const rotateX = (0.5 - py) * 8;

    setRotate({ x: rotateX, y: rotateY });
  }

  function resetTilt() {
    setRotate({ x: 0, y: 0 });
  }

  function handleOpenTask() {
    dispatch(openTaskModal(task.id));
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-testid="task-card"
      className={cn("transform-gpu", isDragging && "opacity-60")}
    >
      <motion.div
        {...(!isTouchDevice ? attributes : {})}
        {...(!isTouchDevice ? listeners : {})}
        role="button"
        tabIndex={0}
        onClick={handleOpenTask}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleOpenTask();
          }
        }}
        onPointerMove={handlePointerMove}
        onPointerLeave={resetTilt}
        whileHover={isTouchDevice ? undefined : { y: -3, scale: 1.01 }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
        style={{
          transformStyle: "preserve-3d",
          rotateX: rotate.x,
          rotateY: rotate.y,
        }}
        className={cn(
          "tf-panel tf-noise group relative w-full overflow-hidden rounded-[1.35rem] p-4 text-left",
          "border border-black/6 transition-colors hover:border-black/10 dark:border-white/8 dark:hover:border-white/16",
          !isTouchDevice && "cursor-grab active:cursor-grabbing",
        )}
      >
        <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-60 dark:via-white/14" />

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="tf-meta">Task</p>
            <h4 className="mt-1 line-clamp-2 text-sm font-semibold leading-5 text-[rgb(var(--foreground))] sm:text-[15px]">
              {task.title}
            </h4>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-[11px] font-medium capitalize",
                priorityClasses[task.priority],
              )}
            >
              {task.priority}
            </span>

            {isTouchDevice && (
              <button
                ref={setActivatorNodeRef}
                type="button"
                {...attributes}
                {...listeners}
                onClick={(event) => event.stopPropagation()}
                className="inline-flex h-9 w-9 touch-none items-center justify-center rounded-full border border-black/8 bg-black/[0.04] text-[rgb(var(--muted-foreground))] transition-colors hover:text-[rgb(var(--foreground))] dark:border-white/10 dark:bg-white/[0.04]"
                aria-label="Drag task"
              >
                <DragHandleIcon />
              </button>
            )}
          </div>
        </div>

        {task.description && (
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-[rgb(var(--muted-foreground))]">
            {task.description}
          </p>
        )}

        <div className="mt-4 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="tf-meta">Due</p>
            <p className="mt-1 truncate text-xs text-[rgb(var(--muted-foreground))]">
              {task.due_date
                ? new Date(task.due_date).toLocaleDateString()
                : "No due date"}
            </p>
          </div>

          <div className="min-w-0 text-right">
            <p className="tf-meta">Assignee</p>
            <p className="mt-1 truncate text-xs text-[rgb(var(--muted-foreground))]">
              {task.assignee?.full_name ?? "Unassigned"}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
