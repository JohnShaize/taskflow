import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { logProjectActivity } from "@/lib/activity";
import { getProjectAccess } from "@/lib/project-access";
import {
  ApiResponse,
  ProjectMember,
  UpdateMemberRolePayload,
  User,
} from "@/types";

type SupabaseProjectMemberRow = {
  id: string;
  project_id: string;
  user_id: string;
  role: ProjectMember["role"];
  joined_at: string;
  profile: User | User[] | null;
};

function normalizeProjectMember(row: SupabaseProjectMemberRow): ProjectMember {
  const profile = Array.isArray(row.profile) ? row.profile[0] : row.profile;

  if (!profile) {
    throw new Error("Member profile is missing");
  }

  return {
    id: row.id,
    project_id: row.project_id,
    user_id: row.user_id,
    role: row.role,
    joined_at: row.joined_at,
    profile,
  };
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string; memberId: string }> },
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { projectId, memberId } = await params;
    const body: UpdateMemberRolePayload = await request.json();

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
        { data: null, error: "Only admins can change roles" },
        { status: 403 },
      );
    }

    const { data: targetMember, error: targetMemberError } = await supabase
      .from("project_members")
      .select("id, user_id, role")
      .eq("id", memberId)
      .eq("project_id", projectId)
      .single();

    if (targetMemberError || !targetMember) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: "Member not found" },
        { status: 404 },
      );
    }

    const { data: targetProfile } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("id", targetMember.user_id)
      .single();

    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("owner_id")
      .eq("id", projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: "Project not found" },
        { status: 404 },
      );
    }

    if (targetMember.user_id === project.owner_id) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: "Project owner role cannot be changed" },
        { status: 400 },
      );
    }

    const { data, error } = await supabase
      .from("project_members")
      .update({ role: body.role })
      .eq("id", memberId)
      .eq("project_id", projectId)
      .select(
        `
        id,
        project_id,
        user_id,
        role,
        joined_at,
        profile:profiles (
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
      console.error("PUT member role error:", error);
      throw error;
    }

    const normalizedMember = normalizeProjectMember(
      data as SupabaseProjectMemberRow,
    );

    if (targetMember.role !== body.role) {
      await logProjectActivity({
        supabase,
        projectId,
        actorId: user.id,
        action: "member_role_changed",
        description: `Changed ${targetProfile?.full_name || targetProfile?.email || "member"} from ${targetMember.role} to ${body.role}`,
        metadata: {
          target_user_id: targetMember.user_id,
          previous_role: targetMember.role,
          new_role: body.role,
        },
      });
    }

    return NextResponse.json<ApiResponse<ProjectMember>>({
      data: normalizedMember,
      error: null,
    });
  } catch (err) {
    console.error("PUT member role catch:", err);

    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "Failed to update member role" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ projectId: string; memberId: string }> },
) {
  try {
    const supabase = await createServerSupabaseClient();
    const { projectId, memberId } = await params;

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
        { data: null, error: "Only admins can remove members" },
        { status: 403 },
      );
    }

    const { data: targetMember, error: targetMemberError } = await supabase
      .from("project_members")
      .select("id, user_id")
      .eq("id", memberId)
      .eq("project_id", projectId)
      .single();

    if (targetMemberError || !targetMember) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: "Member not found" },
        { status: 404 },
      );
    }

    const { data: targetProfile } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("id", targetMember.user_id)
      .single();

    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("owner_id")
      .eq("id", projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: "Project not found" },
        { status: 404 },
      );
    }

    if (targetMember.user_id === project.owner_id) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: "Project owner cannot be removed" },
        { status: 400 },
      );
    }

    const { error } = await supabase
      .from("project_members")
      .delete()
      .eq("id", memberId)
      .eq("project_id", projectId);

    if (error) {
      console.error("DELETE member error:", error);
      throw error;
    }

    await logProjectActivity({
      supabase,
      projectId,
      actorId: user.id,
      action: "member_removed",
      description: `Removed ${targetProfile?.full_name || targetProfile?.email || "member"} from the project`,
      metadata: {
        removed_user_id: targetMember.user_id,
      },
    });

    return NextResponse.json<ApiResponse<null>>({
      data: null,
      error: null,
    });
  } catch (err) {
    console.error("DELETE member catch:", err);

    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "Failed to remove member" },
      { status: 500 },
    );
  }
}
