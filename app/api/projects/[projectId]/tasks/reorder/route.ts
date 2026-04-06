import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { logProjectActivity } from "@/lib/activity";
import { ApiResponse, ReorderTaskItem, TaskStatus } from "@/types";

function statusLabel(status: TaskStatus) {
  switch (status) {
    case "todo":
      return "Todo";
    case "in_progress":
      return "In Progress";
    case "done":
      return "Done";
    default:
      return status;
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { projectId } = await params;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = (await request.json()) as { tasks: ReorderTaskItem[] };

    if (!Array.isArray(body.tasks)) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: "Invalid payload" },
        { status: 400 },
      );
    }

    const taskIds = body.tasks.map((task) => task.id);

    const { data: existingTasks, error: existingTasksError } = await supabase
      .from("tasks")
      .select("id, title, status, position")
      .in("id", taskIds)
      .eq("project_id", projectId);

    if (existingTasksError) {
      console.error("PATCH /reorder existingTasks error:", existingTasksError);
      throw existingTasksError;
    }

    const previousTaskMap = new Map(
      (existingTasks ?? []).map((task) => [task.id, task]),
    );

    const updates = body.tasks.map((task) =>
      supabase
        .from("tasks")
        .update({
          status: task.status,
          position: task.position,
          updated_at: new Date().toISOString(),
        })
        .eq("id", task.id)
        .eq("project_id", projectId),
    );

    const results = await Promise.all(updates);
    const failed = results.find((result) => result.error);

    if (failed?.error) {
      console.error("PATCH /reorder task update error:", failed.error);
      throw failed.error;
    }

    for (const movedTask of body.tasks) {
      const previous = previousTaskMap.get(movedTask.id);

      if (!previous) continue;

      if (previous.status !== movedTask.status) {
        await logProjectActivity({
          supabase,
          projectId,
          actorId: user.id,
          action: "task_moved",
          description: `Moved "${previous.title}" from ${statusLabel(previous.status)} to ${statusLabel(movedTask.status)}`,
          metadata: {
            task_id: movedTask.id,
            from_status: previous.status,
            to_status: movedTask.status,
          },
        });
      }
    }

    return NextResponse.json<ApiResponse<null>>({
      data: null,
      error: null,
    });
  } catch (err) {
    console.error("PATCH /reorder catch:", err);

    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "Failed to reorder tasks" },
      { status: 500 },
    );
  }
}
