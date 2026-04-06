import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { ApiResponse, MyTasksOverview, Task } from "@/types";

function normalizeJoinedObject<T>(
  value: T | T[] | null | undefined,
): T | undefined {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

function dedupeTasks(tasks: Task[]) {
  const map = new Map<string, Task>();

  tasks.forEach((task) => {
    map.set(task.id, task);
  });

  return [...map.values()];
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

function sortByDueSoon(tasks: Task[]) {
  return [...tasks].sort((a, b) => {
    if (!a.due_date && !b.due_date) return 0;
    if (!a.due_date) return 1;
    if (!b.due_date) return -1;
    return a.due_date.localeCompare(b.due_date);
  });
}

function sortByUpdatedDesc(tasks: Task[]) {
  return [...tasks].sort((a, b) => {
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });
}

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const taskSelect = `
      *,
      assignee:profiles!tasks_assignee_id_fkey(
        id,
        email,
        full_name,
        avatar_url,
        created_at
      )
    `;

    const [assignedResult, createdResult] = await Promise.all([
      supabase
        .from("tasks")
        .select(taskSelect)
        .eq("assignee_id", user.id)
        .order("updated_at", { ascending: false }),

      supabase
        .from("tasks")
        .select(taskSelect)
        .eq("created_by", user.id)
        .order("updated_at", { ascending: false }),
    ]);

    if (assignedResult.error) {
      console.error(
        "GET /api/tasks/my assignedResult error:",
        assignedResult.error,
      );
      throw assignedResult.error;
    }

    if (createdResult.error) {
      console.error(
        "GET /api/tasks/my createdResult error:",
        createdResult.error,
      );
      throw createdResult.error;
    }

    const assignedToMe = ((assignedResult.data ?? []) as Task[]).map(
      (task) => ({
        ...task,
        assignee: normalizeJoinedObject(task.assignee),
      }),
    );

    const createdByMe = ((createdResult.data ?? []) as Task[]).map((task) => ({
      ...task,
      assignee: normalizeJoinedObject(task.assignee),
    }));

    const baseTasks = dedupeTasks([...assignedToMe, ...createdByMe]);
    const baseTaskIds = baseTasks.map((task) => task.id);

    let withRecentComments: Task[] = [];

    if (baseTaskIds.length > 0) {
      const commentsResult = await supabase
        .from("task_comments")
        .select("task_id, created_at")
        .in("task_id", baseTaskIds)
        .order("created_at", { ascending: false })
        .limit(50);

      if (commentsResult.error) {
        console.error(
          "GET /api/tasks/my commentsResult error:",
          commentsResult.error,
        );
        throw commentsResult.error;
      }

      const commentTaskIds = [
        ...new Set((commentsResult.data ?? []).map((item) => item.task_id)),
      ];

      withRecentComments = commentTaskIds
        .map((taskId) => baseTasks.find((task) => task.id === taskId))
        .filter((task): task is Task => Boolean(task));
    }

    const allTasks = dedupeTasks([
      ...assignedToMe,
      ...createdByMe,
      ...withRecentComments,
    ]);

    const today = getTodayString();
    const endOfWeek = getEndOfWeekString();

    const overdue = sortByDueSoon(
      allTasks.filter(
        (task) =>
          Boolean(task.due_date) &&
          task.status !== "done" &&
          task.due_date! < today,
      ),
    );

    const dueToday = sortByDueSoon(
      allTasks.filter(
        (task) =>
          Boolean(task.due_date) &&
          task.status !== "done" &&
          task.due_date === today,
      ),
    );

    const dueThisWeek = sortByDueSoon(
      allTasks.filter(
        (task) =>
          Boolean(task.due_date) &&
          task.status !== "done" &&
          task.due_date! > today &&
          task.due_date! <= endOfWeek,
      ),
    );

    const noDueDate = sortByUpdatedDesc(
      allTasks.filter((task) => !task.due_date && task.status !== "done"),
    );

    const overview: MyTasksOverview = {
      allTasks: sortByUpdatedDesc(allTasks),
      assignedToMe: sortByDueSoon(
        assignedToMe.filter((task) => task.status !== "done"),
      ),
      overdue,
      dueToday,
      dueThisWeek,
      noDueDate,
      createdByMe: sortByUpdatedDesc(createdByMe),
      withRecentComments,
    };

    return NextResponse.json<ApiResponse<MyTasksOverview>>({
      data: overview,
      error: null,
    });
  } catch (err) {
    console.error("GET /api/tasks/my catch:", err);

    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "Failed to load my tasks overview" },
      { status: 500 },
    );
  }
}
