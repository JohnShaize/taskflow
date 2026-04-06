import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { getProjectAccess } from "@/lib/project-access";
import { ApiResponse, Project, UpdateProjectPayload } from "@/types";

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
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single();

    if (error) {
      console.error("GET project error:", error);
      throw error;
    }

    return NextResponse.json<ApiResponse<Project>>({
      data,
      error: null,
    });
  } catch (err) {
    console.error("GET project catch:", err);

    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "Failed to fetch project" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { projectId } = await params;
    const body: UpdateProjectPayload = await request.json();

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

    if (!access.project) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: "Project not found" },
        { status: 404 },
      );
    }

    if (access.role !== "owner" && access.role !== "admin") {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: "Only admins can update project settings" },
        { status: 403 },
      );
    }

    const { data, error } = await supabase
      .from("projects")
      .update({
        name: body.name,
        description: body.description ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", projectId)
      .select("*")
      .single();

    if (error) {
      console.error("PUT project error:", error);
      throw error;
    }

    return NextResponse.json<ApiResponse<Project>>({
      data,
      error: null,
    });
  } catch (err) {
    console.error("PUT project catch:", err);

    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "Failed to update project" },
      { status: 500 },
    );
  }
}

export async function DELETE(
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

    if (!access.project) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: "Project not found" },
        { status: 404 },
      );
    }

    if (access.role !== "owner" && access.role !== "admin") {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: "Only admins can delete projects" },
        { status: 403 },
      );
    }

    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", projectId);

    if (error) {
      console.error("DELETE project error:", error);
      throw error;
    }

    return NextResponse.json<ApiResponse<null>>({
      data: null,
      error: null,
    });
  } catch (err) {
    console.error("DELETE project catch:", err);

    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "Failed to delete project" },
      { status: 500 },
    );
  }
}
