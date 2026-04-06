import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { logProjectActivity } from "@/lib/activity";
import { getProjectAccess } from "@/lib/project-access";
import {
  ApiResponse,
  InviteMemberPayload,
  ProjectMember,
  ProjectRole,
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
      .from("project_members")
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
      .eq("project_id", projectId)
      .order("joined_at", { ascending: true });

    if (error) {
      console.error("GET members error:", error);
      throw error;
    }

    const normalizedMembers = ((data ?? []) as SupabaseProjectMemberRow[]).map(
      normalizeProjectMember,
    );

    return NextResponse.json<ApiResponse<ProjectMember[]>>({
      data: normalizedMembers,
      error: null,
    });
  } catch (err) {
    console.error("GET members catch:", err);

    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "Failed to fetch members" },
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
    const body: InviteMemberPayload = await request.json();

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
        { data: null, error: "Only admins can invite members" },
        { status: 403 },
      );
    }

    const email = body.email.trim().toLowerCase();
    const role: ProjectRole = body.role ?? "member";

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, email, full_name")
      .eq("email", email)
      .single();

    if (profileError || !profile) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: "User not found. They must sign up first." },
        { status: 404 },
      );
    }

    const { data: existingMembership } = await supabase
      .from("project_members")
      .select("id")
      .eq("project_id", projectId)
      .eq("user_id", profile.id)
      .maybeSingle();

    if (existingMembership) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: "User is already a member of this project" },
        { status: 409 },
      );
    }

    const { data, error } = await supabase
      .from("project_members")
      .insert({
        project_id: projectId,
        user_id: profile.id,
        role,
      })
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
      console.error("POST members error:", error);
      throw error;
    }

    const normalizedMember = normalizeProjectMember(
      data as SupabaseProjectMemberRow,
    );

    await logProjectActivity({
      supabase,
      projectId,
      actorId: user.id,
      action: "member_invited",
      description: `Invited ${profile.full_name || profile.email} as ${role}`,
      metadata: {
        invited_user_id: profile.id,
        invited_email: profile.email,
        role,
      },
    });

    return NextResponse.json<ApiResponse<ProjectMember>>(
      {
        data: normalizedMember,
        error: null,
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("POST members catch:", err);

    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "Failed to invite member" },
      { status: 500 },
    );
  }
}
