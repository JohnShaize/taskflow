import { SupabaseClient } from "@supabase/supabase-js";
import { ProjectActivityAction } from "@/types";

interface LogProjectActivityParams {
  supabase: SupabaseClient;
  projectId: string;
  actorId: string;
  action: ProjectActivityAction;
  description: string;
  metadata?: Record<string, unknown> | null;
}

export async function logProjectActivity({
  supabase,
  projectId,
  actorId,
  action,
  description,
  metadata = null,
}: LogProjectActivityParams) {
  const { error } = await supabase.from("project_activity").insert({
    project_id: projectId,
    actor_id: actorId,
    action,
    description,
    metadata,
  });

  if (error) {
    console.error("Failed to write project activity:", error);
  }
}
