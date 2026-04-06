import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { logProjectActivity } from "@/lib/activity";
import { ApiResponse, Task, TaskStatus, UpdateTaskPayload } from "@/types";

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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> },
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { taskId } = await params;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body: UpdateTaskPayload = await request.json();

    const { data: existingTask, error: existingTaskError } = await supabase
      .from("tasks")
      .select(
        "id, project_id, title, status, description, priority, assignee_id, due_date",
      )
      .eq("id", taskId)
      .single();

    if (existingTaskError || !existingTask) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: "Task not found" },
        { status: 404 },
      );
    }

    if (body.assignee_id !== undefined && body.assignee_id !== null) {
      const { data: memberCheck, error: memberCheckError } = await supabase
        .from("project_members")
        .select("id")
        .eq("project_id", existingTask.project_id)
        .eq("user_id", body.assignee_id)
        .maybeSingle();

      if (memberCheckError) {
        console.error(
          "PUT /api/tasks/[taskId] memberCheck error:",
          memberCheckError,
        );
        throw memberCheckError;
      }

      if (!memberCheck) {
        return NextResponse.json<ApiResponse<null>>(
          {
            data: null,
            error: "Selected assignee is not a member of this project",
          },
          { status: 400 },
        );
      }
    }

    const updateData = {
      ...(body.title !== undefined ? { title: body.title } : {}),
      ...(body.description !== undefined
        ? { description: body.description }
        : {}),
      ...(body.status !== undefined ? { status: body.status } : {}),
      ...(body.priority !== undefined ? { priority: body.priority } : {}),
      ...(body.assignee_id !== undefined
        ? { assignee_id: body.assignee_id }
        : {}),
      ...(body.due_date !== undefined ? { due_date: body.due_date } : {}),
      ...(body.position !== undefined ? { position: body.position } : {}),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("tasks")
      .update(updateData)
      .eq("id", taskId)
      .select(
        `
        *,
        assignee:profiles!tasks_assignee_id_fkey(
          id,
          email,
          full_name,
          avatar_url,
          created_at
        )
      `,
      )
      .single();

    if (error) {
      console.error("PUT /api/tasks/[taskId] error:", error);
      throw error;
    }

    if (body.status !== undefined && body.status !== existingTask.status) {
      await logProjectActivity({
        supabase,
        projectId: existingTask.project_id,
        actorId: user.id,
        action: "task_moved",
        description: `Moved "${existingTask.title}" from ${statusLabel(existingTask.status)} to ${statusLabel(body.status)}`,
        metadata: {
          task_id: taskId,
          from_status: existingTask.status,
          to_status: body.status,
        },
      });
    } else {
      await logProjectActivity({
        supabase,
        projectId: existingTask.project_id,
        actorId: user.id,
        action: "task_updated",
        description: `Updated task "${body.title ?? existingTask.title}"`,
        metadata: {
          task_id: taskId,
        },
      });
    }

    return NextResponse.json<ApiResponse<Task>>({
      data,
      error: null,
    });
  } catch (err) {
    console.error("PUT /api/tasks/[taskId] catch:", err);

    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "Failed to update task" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> },
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { taskId } = await params;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const { error } = await supabase.from("tasks").delete().eq("id", taskId);

    if (error) {
      console.error("DELETE /api/tasks/[taskId] error:", error);
      throw error;
    }

    return NextResponse.json<ApiResponse<null>>({
      data: null,
      error: null,
    });
  } catch (err) {
    console.error("DELETE /api/tasks/[taskId] catch:", err);

    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "Failed to delete task" },
      { status: 500 },
    );
  }
}
