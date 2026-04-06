import { User } from "./auth.types";

export type ProjectActivityAction =
  | "project_created"
  | "member_invited"
  | "member_role_changed"
  | "member_removed"
  | "task_moved"
  | "task_updated"
  | "task_deleted";

export interface ProjectActivity {
  id: string;
  project_id: string;
  actor_id: string | null;
  action: ProjectActivityAction;
  description: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
  actor?: User;
}
