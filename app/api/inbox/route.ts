import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { getAccessibleProjectIds } from "@/lib/project-access";
import { ApiResponse, InboxItem, InboxOverview, Task } from "@/types";

function normalizeJoinedObject<T>(
  value: T | T[] | null | undefined,
): T | undefined {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

function dedupeTasks(tasks: Task[]) {
  const map = new Map<string, Task>();

  tasks.forEach((task) => {
    map.set(task.id, task);
  });

  return [...map.values()];
}

function classifyActivityKind(
  action?: string | null,
  description?: string | null,
) {
  const actionText = (action ?? "").toLowerCase();
  const descriptionText = (description ?? "").toLowerCase();

  const memberSignals = [
    "member",
    "invite",
    "invited",
    "removed",
    "role",
    "admin",
  ];

  const isMemberEvent =
    memberSignals.some((signal) => actionText.includes(signal)) ||
    memberSignals.some((signal) => descriptionText.includes(signal));

  return isMemberEvent ? "member_event" : "project_event";
}

function buildEmptyOverview(): InboxOverview {
  return {
    items: [],
    relatedTasks: [],
    counts: {
      all: 0,
      comments: 0,
      assignments: 0,
      project_events: 0,
      member_events: 0,
    },
  };
}

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
      return NextResponse.json<ApiResponse<InboxOverview>>({
        data: buildEmptyOverview(),
        error: null,
      });
    }

    const { data: projectsData, error: projectsError } = await supabase
      .from("projects")
      .select("*")
      .in("id", accessibleProjectIds)
      .order("updated_at", { ascending: false });

    if (projectsError) {
      console.error("GET /api/inbox projects error:", projectsError);
      throw projectsError;
    }

    const projects = projectsData ?? [];
    const projectIds = projects.map((project) => project.id);

    if (projectIds.length === 0) {
      return NextResponse.json<ApiResponse<InboxOverview>>({
        data: buildEmptyOverview(),
        error: null,
      });
    }

    const projectNameMap = new Map<string, string>(
      projects.map((project) => [project.id, project.name]),
    );

    const taskSelect = `
      *,
      assignee:profiles!tasks_assignee_id_fkey(
        id,
        email,
        full_name,
        avatar_url,
        created_at
      )
    `;

    const [assignedResult, createdResult, activityResult] = await Promise.all([
      supabase
        .from("tasks")
        .select(taskSelect)
        .eq("assignee_id", user.id)
        .in("project_id", projectIds)
        .order("updated_at", { ascending: false })
        .limit(30),

      supabase
        .from("tasks")
        .select(taskSelect)
        .eq("created_by", user.id)
        .in("project_id", projectIds)
        .order("updated_at", { ascending: false })
        .limit(30),

      supabase
        .from("project_activity")
        .select(
          `
          *,
          actor:profiles!project_activity_actor_id_fkey(
            id,
            email,
            full_name,
            avatar_url,
            created_at
          )
        `,
        )
        .in("project_id", projectIds)
        .order("created_at", { ascending: false })
        .limit(50),
    ]);

    if (assignedResult.error) {
      console.error(
        "GET /api/inbox assignedResult error:",
        assignedResult.error,
      );
      throw assignedResult.error;
    }

    if (createdResult.error) {
      console.error("GET /api/inbox createdResult error:", createdResult.error);
      throw createdResult.error;
    }

    if (activityResult.error) {
      console.error(
        "GET /api/inbox activityResult error:",
        activityResult.error,
      );
      throw activityResult.error;
    }

    const assignedTasks = ((assignedResult.data ?? []) as Task[]).map(
      (task) => ({
        ...task,
        assignee: normalizeJoinedObject(task.assignee),
      }),
    );

    const createdTasks = ((createdResult.data ?? []) as Task[]).map((task) => ({
      ...task,
      assignee: normalizeJoinedObject(task.assignee),
    }));

    const monitoredTasks = dedupeTasks([...assignedTasks, ...createdTasks]);
    const monitoredTaskIds = monitoredTasks.map((task) => task.id);
    const taskMap = new Map(monitoredTasks.map((task) => [task.id, task]));

    let commentItems: InboxItem[] = [];

    if (monitoredTaskIds.length > 0) {
      const commentsResult = await supabase
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
        .in("task_id", monitoredTaskIds)
        .neq("author_id", user.id)
        .order("created_at", { ascending: false })
        .limit(40);

      if (commentsResult.error) {
        console.error(
          "GET /api/inbox commentsResult error:",
          commentsResult.error,
        );
        throw commentsResult.error;
      }

      commentItems = (commentsResult.data ?? []).reduce<InboxItem[]>(
        (acc, comment) => {
          const task = taskMap.get(comment.task_id);
          const author = normalizeJoinedObject(comment.author);

          if (!task) return acc;

          acc.push({
            id: `comment-${comment.id}`,
            kind: "comment",
            title: task.title,
            description: comment.content,
            created_at: comment.created_at,
            project_id: task.project_id,
            project_name:
              projectNameMap.get(task.project_id) ?? "Unknown project",
            task_id: task.id,
            task_title: task.title,
            actor_name: author?.full_name ?? author?.email ?? null,
            actor_email: author?.email ?? null,
            status: task.status,
            priority: task.priority,
          });

          return acc;
        },
        [],
      );
    }

    const assignmentItems: InboxItem[] = assignedTasks.map((task) => ({
      id: `assignment-${task.id}`,
      kind: "assignment",
      title: "Assigned to you",
      description: task.title,
      created_at: task.updated_at,
      project_id: task.project_id,
      project_name: projectNameMap.get(task.project_id) ?? "Unknown project",
      task_id: task.id,
      task_title: task.title,
      actor_name: null,
      actor_email: null,
      status: task.status,
      priority: task.priority,
    }));

    const activityItems: InboxItem[] = (activityResult.data ?? []).map(
      (item) => {
        const actor = normalizeJoinedObject(item.actor);
        const kind = classifyActivityKind(item.action, item.description);

        return {
          id: `activity-${item.id}`,
          kind,
          title: kind === "member_event" ? "Member update" : "Project update",
          description: item.description ?? "Workspace activity update",
          created_at: item.created_at,
          project_id: item.project_id ?? null,
          project_name:
            projectNameMap.get(item.project_id) ?? "Unknown project",
          task_id: null,
          task_title: null,
          actor_name: actor?.full_name ?? actor?.email ?? null,
          actor_email: actor?.email ?? null,
          status: null,
          priority: null,
        };
      },
    );

    const items = [...commentItems, ...assignmentItems, ...activityItems]
      .sort((a, b) => {
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      })
      .slice(0, 80);

    const overview: InboxOverview = {
      items,
      relatedTasks: monitoredTasks,
      counts: {
        all: items.length,
        comments: items.filter((item) => item.kind === "comment").length,
        assignments: items.filter((item) => item.kind === "assignment").length,
        project_events: items.filter((item) => item.kind === "project_event")
          .length,
        member_events: items.filter((item) => item.kind === "member_event")
          .length,
      },
    };

    return NextResponse.json<ApiResponse<InboxOverview>>({
      data: overview,
      error: null,
    });
  } catch (err) {
    console.error("GET /api/inbox catch:", err);

    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "Failed to load inbox overview" },
      { status: 500 },
    );
  }
}
