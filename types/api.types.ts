import { TaskStatus, TaskPriority, Task, TaskComment } from "./task.types";
import { ProjectRole, Project } from "./project.types";
import { ProjectActivity } from "./activity.types";

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  priority: TaskPriority;
  assignee_id?: string;
  due_date?: string;
  project_id: string;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignee_id?: string | null;
  due_date?: string | null;
  position?: number;
}

export interface CreateTaskCommentPayload {
  taskId: string;
  content: string;
}

export interface ReorderTaskItem {
  id: string;
  status: TaskStatus;
  position: number;
}

export interface ReorderTasksPayload {
  projectId: string;
  tasks: ReorderTaskItem[];
}

export interface CreateProjectPayload {
  name: string;
  description?: string;
}

export interface UpdateProjectPayload {
  name: string;
  description?: string | null;
}

export interface InviteMemberPayload {
  email: string;
  role: ProjectRole;
}

export interface UpdateMemberRolePayload {
  role: ProjectRole;
}

export type DashboardDateRange = "7d" | "30d" | "90d";

export interface DashboardOverviewQueryParams {
  projectId?: string;
  range?: DashboardDateRange;
}

export interface DashboardProjectSummary {
  project: Project;
  totalTasks: number;
  openTasks: number;
  overdueTasks: number;
  completedTasks: number;
  membersCount: number;
  progress: number;
  activityCount: number;
  lastActivityAt: string | null;
}

export interface DashboardTaskCommentSummary extends TaskComment {
  task_title: string;
  project_id: string;
  project_name: string;
}

export interface DashboardWorkloadMember {
  user_id: string;
  name: string;
  email: string;
  assignedTasks: number;
  overdueTasks: number;
  completedTasks: number;
}

export interface DashboardStatusDistribution {
  todo: number;
  in_progress: number;
  done: number;
}

export interface DashboardCompletionTrendPoint {
  date: string;
  completed: number;
}

export interface DashboardOverview {
  totalProjects: number;
  overdueTasks: number;
  dueToday: number;
  completedThisWeek: number;
  assignedToMeTasks: Task[];
  createdByMeTasks: Task[];
  upcomingDeadlines: Task[];
  recentCommentsOnMyTasks: DashboardTaskCommentSummary[];
  recentActivity: ProjectActivity[];
  projectSummaries: DashboardProjectSummary[];
  workloadByMember: DashboardWorkloadMember[];
  statusDistribution: DashboardStatusDistribution;
  completionTrend: DashboardCompletionTrendPoint[];
  mostActiveProject: DashboardProjectSummary | null;
  leastActiveProject: DashboardProjectSummary | null;
  mostOverdueProject: DashboardProjectSummary | null;
}

export type MyTasksDueBucket =
  | "all"
  | "overdue"
  | "today"
  | "this_week"
  | "no_due_date";

export type MyTasksSortBy = "due_soon" | "recently_updated" | "priority";

export interface MyTasksOverview {
  allTasks: Task[];
  assignedToMe: Task[];
  overdue: Task[];
  dueToday: Task[];
  dueThisWeek: Task[];
  noDueDate: Task[];
  createdByMe: Task[];
  withRecentComments: Task[];
}

export type InboxFilterKind =
  | "all"
  | "comments"
  | "assignments"
  | "project_events"
  | "member_events";

export type InboxItemKind =
  | "comment"
  | "assignment"
  | "project_event"
  | "member_event";

export interface InboxItem {
  id: string;
  kind: InboxItemKind;
  title: string;
  description: string;
  created_at: string;
  project_id: string | null;
  project_name: string | null;
  task_id: string | null;
  task_title: string | null;
  actor_name: string | null;
  actor_email: string | null;
  status?: TaskStatus | null;
  priority?: TaskPriority | null;
}

export interface InboxOverview {
  items: InboxItem[];
  relatedTasks: Task[];
  counts: {
    all: number;
    comments: number;
    assignments: number;
    project_events: number;
    member_events: number;
  };
}
