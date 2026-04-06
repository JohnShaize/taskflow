import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { getProjectAccess } from "@/lib/project-access";
import { ApiResponse, CreateTaskPayload, Task } from "@/types";

export async function GET(
  _request: NextRequest,
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

    const access = await getProjectAccess(supabase, projectId, user.id);

    if (!access.project || !access.role) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: "Project not found" },
        { status: 404 },
      );
    }

    const { data, error } = await supabase
      .from("tasks")
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
      .eq("project_id", projectId)
      .order("status", { ascending: true })
      .order("position", { ascending: true });

    if (error) {
      console.error("GET /api/projects/[projectId]/tasks error:", error);
      throw error;
    }

    return NextResponse.json<ApiResponse<Task[]>>({
      data: data ?? [],
      error: null,
    });
  } catch (err) {
    console.error("GET /api/projects/[projectId]/tasks catch:", err);

    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "Failed to fetch tasks" },
      { status: 500 },
    );
  }
}

export async function POST(
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

    const access = await getProjectAccess(supabase, projectId, user.id);

    if (!access.project || !access.role) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: "Project not found" },
        { status: 404 },
      );
    }

    const body: CreateTaskPayload = await request.json();

    if (body.assignee_id) {
      const { data: memberCheck, error: memberCheckError } = await supabase
        .from("project_members")
        .select("id")
        .eq("project_id", projectId)
        .eq("user_id", body.assignee_id)
        .maybeSingle();

      if (memberCheckError) {
        console.error(
          "POST /api/projects/[projectId]/tasks memberCheck error:",
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

    const { data: lastTask, error: lastTaskError } = await supabase
      .from("tasks")
      .select("position")
      .eq("project_id", projectId)
      .eq("status", "todo")
      .order("position", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastTaskError) {
      console.error(
        "POST /api/projects/[projectId]/tasks lastTask error:",
        lastTaskError,
      );
      throw lastTaskError;
    }

    const nextPosition = lastTask ? lastTask.position + 1 : 0;

    const { data, error } = await supabase
      .from("tasks")
      .insert({
        project_id: projectId,
        title: body.title,
        description: body.description ?? null,
        priority: body.priority ?? "medium",
        assignee_id: body.assignee_id ?? null,
        due_date: body.due_date ?? null,
        created_by: user.id,
        status: "todo",
        position: nextPosition,
      })
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
      console.error(
        "POST /api/projects/[projectId]/tasks insert error:",
        error,
      );
      throw error;
    }

    return NextResponse.json<ApiResponse<Task>>(
      {
        data,
        error: null,
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("POST /api/projects/[projectId]/tasks catch:", err);

    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "Failed to create task" },
      { status: 500 },
    );
  }
}
