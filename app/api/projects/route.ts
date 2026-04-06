import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { logProjectActivity } from "@/lib/activity";
import { getAccessibleProjectIds } from "@/lib/project-access";
import { ApiResponse, Project, CreateProjectPayload } from "@/types";

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

    const accessibleProjectIds = await getAccessibleProjectIds(
      supabase,
      user.id,
    );

    if (accessibleProjectIds.length === 0) {
      return NextResponse.json<ApiResponse<Project[]>>({
        data: [],
        error: null,
      });
    }

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .in("id", accessibleProjectIds)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("GET /api/projects DB error:", error);
      throw error;
    }

    return NextResponse.json<ApiResponse<Project[]>>({
      data: data ?? [],
      error: null,
    });
  } catch (err) {
    console.error("GET /api/projects error:", err);

    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "Failed to fetch projects" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body: CreateProjectPayload = await request.json();

    const { data: project, error: projectError } = await supabase
      .from("projects")
      .insert({
        name: body.name,
        description: body.description ?? null,
        owner_id: user.id,
      })
      .select()
      .single();

    if (projectError) {
      console.error("POST /api/projects project insert error:", projectError);
      throw projectError;
    }

    const { error: memberError } = await supabase
      .from("project_members")
      .insert({
        project_id: project.id,
        user_id: user.id,
        role: "admin",
      });

    if (memberError) {
      console.error("POST /api/projects member insert error:", memberError);

      await supabase.from("projects").delete().eq("id", project.id);

      throw memberError;
    }

    await logProjectActivity({
      supabase,
      projectId: project.id,
      actorId: user.id,
      action: "project_created",
      description: `Created project "${project.name}"`,
      metadata: {
        project_name: project.name,
      },
    });

    return NextResponse.json<ApiResponse<Project>>(
      { data: project, error: null },
      { status: 201 },
    );
  } catch (err) {
    console.error("POST /api/projects error:", err);

    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "Failed to create project" },
      { status: 500 },
    );
  }
}
