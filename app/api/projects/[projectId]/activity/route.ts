import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { getProjectAccess } from "@/lib/project-access";
import { ApiResponse, ProjectActivity, User } from "@/types";

type SupabaseProjectActivityRow = {
  id: string;
  project_id: string;
  actor_id: string | null;
  action: ProjectActivity["action"];
  description: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
  actor: User | User[] | null;
};

function normalizeProjectActivity(
  row: SupabaseProjectActivityRow,
): ProjectActivity {
  const actor = Array.isArray(row.actor) ? row.actor[0] : row.actor;

  return {
    id: row.id,
    project_id: row.project_id,
    actor_id: row.actor_id,
    action: row.action,
    description: row.description,
    metadata: row.metadata,
    created_at: row.created_at,
    actor: actor ?? undefined,
  };
}

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
      .from("project_activity")
      .select(
        `
        id,
        project_id,
        actor_id,
        action,
        description,
        metadata,
        created_at,
        actor:profiles (
          id,
          email,
          full_name,
          avatar_url,
          created_at
        )
      `,
      )
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("GET project activity error:", error);
      throw error;
    }

    const normalizedActivity = (
      (data ?? []) as SupabaseProjectActivityRow[]
    ).map(normalizeProjectActivity);

    return NextResponse.json<ApiResponse<ProjectActivity[]>>({
      data: normalizedActivity,
      error: null,
    });
  } catch (err) {
    console.error("GET project activity catch:", err);

    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "Failed to fetch project activity" },
      { status: 500 },
    );
  }
}
