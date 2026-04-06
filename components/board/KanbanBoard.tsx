"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  DndContext,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setTasks } from "@/store/slices/boardSlice";
import { openTaskModal } from "@/store/slices/uiSlice";
import { useReorderTasksMutation } from "@/services/tasksApi";
import { Task, TaskStatus } from "@/types";
import { BoardColumn } from "./BoardColumn";
import { BoardFilters } from "./BoardFilters";
import { TaskModal } from "./TaskModal";

const TASK_STATUSES: TaskStatus[] = ["todo", "in_progress", "done"];

interface KanbanBoardProps {
  projectId: string;
}

function isTaskStatus(value: string): value is TaskStatus {
  return TASK_STATUSES.includes(value as TaskStatus);
}

function sortByPosition(tasks: Task[]) {
  return [...tasks].sort((a, b) => a.position - b.position);
}

function getTaskStatusFromId(tasks: Task[], id: string): TaskStatus | null {
  if (isTaskStatus(id)) return id;

  const task = tasks.find((item) => item.id === id);
  return task?.status ?? null;
}

export function KanbanBoard({ projectId }: KanbanBoardProps) {
  const dispatch = useAppDispatch();
  const tasks = useAppSelector((state) => state.board.tasks);
  const filteredPriority = useAppSelector(
    (state) => state.board.filteredPriority,
  );
  const [reorderTasks] = useReorderTasksMutation();

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 128,
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const filteredTasks = useMemo(() => {
    let result = [...tasks];

    if (filteredPriority) {
      result = result.filter((task) => task.priority === filteredPriority);
    }

    return sortByPosition(result);
  }, [tasks, filteredPriority]);

  const todoTasks = filteredTasks.filter((task) => task.status === "todo");
  const inProgressTasks = filteredTasks.filter(
    (task) => task.status === "in_progress",
  );
  const doneTasks = filteredTasks.filter((task) => task.status === "done");

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    if (activeId === overId) return;

    const previousTasks = [...tasks];
    const activeTask = tasks.find((task) => task.id === activeId);

    if (!activeTask) return;

    const sourceStatus = activeTask.status;
    const destinationStatus = getTaskStatusFromId(tasks, overId);

    if (!destinationStatus) return;

    let nextTasks: Task[] = [];

    if (sourceStatus === destinationStatus) {
      const sameColumnTasks = sortByPosition(
        tasks.filter((task) => task.status === sourceStatus),
      );

      const oldIndex = sameColumnTasks.findIndex(
        (task) => task.id === activeId,
      );

      const newIndex = isTaskStatus(overId)
        ? sameColumnTasks.length - 1
        : sameColumnTasks.findIndex((task) => task.id === overId);

      if (oldIndex === -1 || newIndex === -1) return;

      const reorderedColumn = arrayMove(
        sameColumnTasks,
        oldIndex,
        newIndex,
      ).map((task, index) => ({
        ...task,
        position: index,
      }));

      nextTasks = tasks.map((task) => {
        const updated = reorderedColumn.find((item) => item.id === task.id);
        return updated ?? task;
      });
    } else {
      const sourceColumnTasks = sortByPosition(
        tasks.filter((task) => task.status === sourceStatus),
      ).filter((task) => task.id !== activeId);

      const targetColumnTasks = sortByPosition(
        tasks.filter((task) => task.status === destinationStatus),
      ).filter((task) => task.id !== activeId);

      const insertIndex = isTaskStatus(overId)
        ? targetColumnTasks.length
        : Math.max(
            targetColumnTasks.findIndex((task) => task.id === overId),
            0,
          );

      const nextSourceColumn = sourceColumnTasks.map((task, index) => ({
        ...task,
        position: index,
      }));

      const movedTask: Task = {
        ...activeTask,
        status: destinationStatus,
      };

      const nextTargetColumn = [
        ...targetColumnTasks.slice(0, insertIndex),
        movedTask,
        ...targetColumnTasks.slice(insertIndex),
      ].map((task, index) => ({
        ...task,
        position: index,
      }));

      nextTasks = tasks.map((task) => {
        if (task.id === activeId) {
          return nextTargetColumn.find((item) => item.id === activeId) ?? task;
        }

        const updatedSourceTask = nextSourceColumn.find(
          (item) => item.id === task.id,
        );
        if (updatedSourceTask) return updatedSourceTask;

        const updatedTargetTask = nextTargetColumn.find(
          (item) => item.id === task.id,
        );
        if (updatedTargetTask) return updatedTargetTask;

        return task;
      });
    }

    dispatch(setTasks(nextTasks));

    const changedTasks = nextTasks
      .filter((task) => {
        const previous = previousTasks.find((item) => item.id === task.id);
        if (!previous) return false;

        return (
          previous.status !== task.status || previous.position !== task.position
        );
      })
      .map((task) => ({
        id: task.id,
        status: task.status,
        position: task.position,
      }));

    try {
      await reorderTasks({
        projectId,
        tasks: changedTasks,
      }).unwrap();
    } catch (error) {
      console.error("Reorder failed:", error);
      dispatch(setTasks(previousTasks));
    }
  }

  return (
    <div className="space-y-5">
      <div className="tf-panel tf-noise rounded-[1.75rem] p-4 sm:p-5">
        <div className="flex flex-col gap-4">
          <BoardFilters />

          <button
            data-testid="add-task-button"
            type="button"
            onClick={() => dispatch(openTaskModal(null))}
            className="tf-btn-primary inline-flex w-full items-center justify-center gap-2 px-5 py-3 text-sm font-medium"
          >
            <span className="text-base leading-none">＋</span>
            Add Task
          </button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 14, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.34, delay: 0.04 }}
          >
            <BoardColumn title="Todo" status="todo" tasks={todoTasks} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.34, delay: 0.08 }}
          >
            <BoardColumn
              title="In Progress"
              status="in_progress"
              tasks={inProgressTasks}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.34, delay: 0.12 }}
          >
            <BoardColumn title="Done" status="done" tasks={doneTasks} />
          </motion.div>
        </div>
      </DndContext>

      <TaskModal projectId={projectId} />
    </div>
  );
}
