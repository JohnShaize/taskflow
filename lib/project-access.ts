import { SupabaseClient } from "@supabase/supabase-js";
import { ProjectRole } from "@/types";

type ProjectAccessRole = ProjectRole | "owner";

interface BasicProjectAccessRow {
  id: string;
  owner_id: string;
}

interface MembershipRow {
  role: ProjectRole;
}

interface OwnedProjectRow {
  id: string;
}

interface ProjectMembershipRow {
  project_id: string;
}

export async function getProjectAccess(
  supabase: SupabaseClient,
  projectId: string,
  userId: string,
): Promise<{
  project: BasicProjectAccessRow | null;
  role: ProjectAccessRole | null;
}> {
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id, owner_id")
    .eq("id", projectId)
    .maybeSingle<BasicProjectAccessRow>();

  if (projectError) {
    throw projectError;
  }

  if (!project) {
    return {
      project: null,
      role: null,
    };
  }

  if (project.owner_id === userId) {
    return {
      project,
      role: "owner",
    };
  }

  const { data: membership, error: membershipError } = await supabase
    .from("project_members")
    .select("role")
    .eq("project_id", projectId)
    .eq("user_id", userId)
    .maybeSingle<MembershipRow>();

  if (membershipError) {
    throw membershipError;
  }

  return {
    project,
    role: membership?.role ?? null,
  };
}

export async function getAccessibleProjectIds(
  supabase: SupabaseClient,
  userId: string,
): Promise<string[]> {
  const [ownedProjectsResult, membershipsResult] = await Promise.all([
    supabase.from("projects").select("id").eq("owner_id", userId),
    supabase.from("project_members").select("project_id").eq("user_id", userId),
  ]);

  if (ownedProjectsResult.error) {
    throw ownedProjectsResult.error;
  }

  if (membershipsResult.error) {
    throw membershipsResult.error;
  }

  const ownedIds = (ownedProjectsResult.data ?? []).map(
    (project: OwnedProjectRow) => project.id,
  );

  const memberIds = (membershipsResult.data ?? []).map(
    (membership: ProjectMembershipRow) => membership.project_id,
  );

  return [...new Set([...ownedIds, ...memberIds])];
}
