import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { ApiResponse, TaskComment } from "@/types";

export async function GET(
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

    const { data, error } = await supabase
      .from("task_comments")
      .select(
        `
        *,
        author:profiles!task_comments_author_id_fkey(
          id,
          email,
          full_name,
          avatar_url,
          created_at
        )
      `,
      )
      .eq("task_id", taskId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("GET /api/tasks/[taskId]/comments error:", error);
      throw error;
    }

    return NextResponse.json<ApiResponse<TaskComment[]>>({
      data: data ?? [],
      error: null,
    });
  } catch (err) {
    console.error("GET /api/tasks/[taskId]/comments catch:", err);

    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "Failed to fetch comments" },
      { status: 500 },
    );
  }
}

export async function POST(
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

    const body = (await request.json()) as { content: string };
    const content = body.content?.trim();

    if (!content) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: "Comment cannot be empty" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("task_comments")
      .insert({
        task_id: taskId,
        author_id: user.id,
        content,
      })
      .select(
        `
        *,
        author:profiles!task_comments_author_id_fkey(
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
      console.error("POST /api/tasks/[taskId]/comments error:", error);
      throw error;
    }

    return NextResponse.json<ApiResponse<TaskComment>>(
      {
        data,
        error: null,
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("POST /api/tasks/[taskId]/comments catch:", err);

    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "Failed to create comment" },
      { status: 500 },
    );
  }
}
