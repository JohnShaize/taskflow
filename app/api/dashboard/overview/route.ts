import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { getAccessibleProjectIds } from "@/lib/project-access";
import {
  ApiResponse,
  DashboardCompletionTrendPoint,
  DashboardDateRange,
  DashboardOverview,
  DashboardProjectSummary,
  DashboardTaskCommentSummary,
  DashboardWorkloadMember,
  Project,
  ProjectActivity,
  Task,
} from "@/types";

function formatDateLocal(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getTodayString() {
  return formatDateLocal(new Date());
}

function normalizeJoinedObject<T>(
  value: T | T[] | null | undefined,
): T | undefined {
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

function getRangeStart(range: DashboardDateRange) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);

  if (range === "7d") {
    date.setDate(date.getDate() - 6);
  } else if (range === "30d") {
    date.setDate(date.getDate() - 29);
  } else {
    date.setDate(date.getDate() - 89);
  }

  return date;
}

function sortByDueDateAsc(a: Task, b: Task) {
  if (!a.due_date && !b.due_date) return 0;
  if (!a.due_date) return 1;
  if (!b.due_date) return -1;
  return a.due_date.localeCompare(b.due_date);
}

function sortByUpdatedDesc<
  T extends { updated_at?: string; created_at?: string },
>(a: T, b: T) {
  const aTime = new Date(a.updated_at ?? a.created_at ?? 0).getTime();
  const bTime = new Date(b.updated_at ?? b.created_at ?? 0).getTime();
  return bTime - aTime;
}

function buildEmptyOverview(): DashboardOverview {
  return {
    totalProjects: 0,
    overdueTasks: 0,
    dueToday: 0,
    completedThisWeek: 0,
    assignedToMeTasks: [],
    createdByMeTasks: [],
    upcomingDeadlines: [],
    recentCommentsOnMyTasks: [],
    recentActivity: [],
    projectSummaries: [],
    workloadByMember: [],
    statusDistribution: {
      todo: 0,
      in_progress: 0,
      done: 0,
    },
    completionTrend: [],
    mostActiveProject: null,
    leastActiveProject: null,
    mostOverdueProject: null,
  };
}

export async function GET(request: NextRequest) {
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

    const projectId =
      request.nextUrl.searchParams.get("projectId") ?? undefined;
    const rawRange = request.nextUrl.searchParams.get("range");

    const range: DashboardDateRange =
      rawRange === "7d" || rawRange === "30d" || rawRange === "90d"
        ? rawRange
        : "30d";

    const rangeStart = getRangeStart(range);
    const rangeStartIso = rangeStart.toISOString();
    const today = getTodayString();

    const accessibleProjectIds = await getAccessibleProjectIds(
      supabase,
      user.id,
    );

    if (accessibleProjectIds.length === 0) {
      return NextResponse.json<ApiResponse<DashboardOverview>>({
        data: buildEmptyOverview(),
        error: null,
      });
    }

    if (projectId && !accessibleProjectIds.includes(projectId)) {
      return NextResponse.json<ApiResponse<null>>(
        { data: null, error: "Project not found" },
        { status: 404 },
      );
    }

    const scopedProjectIds = projectId ? [projectId] : accessibleProjectIds;

    const { data: projectsData, error: projectsError } = await supabase
      .from("projects")
      .select("*")
      .in("id", scopedProjectIds)
      .order("updated_at", { ascending: false });

    if (projectsError) {
      console.error(
        "GET /api/dashboard/overview projects error:",
        projectsError,
      );
      throw projectsError;
    }

    const projects = (projectsData ?? []) as Project[];
    const projectIds = projects.map((project) => project.id);

    if (projectIds.length === 0) {
      return NextResponse.json<ApiResponse<DashboardOverview>>({
        data: buildEmptyOverview(),
        error: null,
      });
    }

    const [membersResult, tasksResult, activityResult] = await Promise.all([
      supabase
        .from("project_members")
        .select(
          `
          id,
          project_id,
          user_id,
          role,
          profile:profiles(
            id,
            email,
            full_name,
            avatar_url,
            created_at
          )
        `,
        )
        .in("project_id", projectIds),

      supabase
        .from("tasks")
        .select(
          `
          *,
          assignee:profiles!tasks_assignee_id_fkey(
            id,
            email,
            full_name,
            avatar_url,
            created_at
          )
        `,
        )
        .in("project_id", projectIds)
        .order("updated_at", { ascending: false }),

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
        .gte("created_at", rangeStartIso)
        .order("created_at", { ascending: false })
        .limit(20),
    ]);

    if (membersResult.error) {
      console.error(
        "GET /api/dashboard/overview members error:",
        membersResult.error,
      );
      throw membersResult.error;
    }

    if (tasksResult.error) {
      console.error(
        "GET /api/dashboard/overview tasks error:",
        tasksResult.error,
      );
      throw tasksResult.error;
    }

    if (activityResult.error) {
      console.error(
        "GET /api/dashboard/overview activity error:",
        activityResult.error,
      );
      throw activityResult.error;
    }

    const tasks = ((tasksResult.data ?? []) as Task[]).map((task) => ({
      ...task,
      assignee: normalizeJoinedObject(task.assignee),
    }));

    const recentActivity = (
      (activityResult.data ?? []) as ProjectActivity[]
    ).map((item) => ({
      ...item,
      actor: normalizeJoinedObject(item.actor),
    }));

    const rawMembers = membersResult.data ?? [];

    const members = rawMembers.map((member) => ({
      ...member,
      profile: normalizeJoinedObject(member.profile),
    }));

    const membersCountByProject = members.reduce<Record<string, number>>(
      (acc, member) => {
        acc[member.project_id] = (acc[member.project_id] ?? 0) + 1;
        return acc;
      },
      {},
    );

    const oneWeekAgo = new Date();
    oneWeekAgo.setHours(0, 0, 0, 0);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const overdueTasks = tasks.filter(
      (task) =>
        Boolean(task.due_date) &&
        task.status !== "done" &&
        task.due_date! < today,
    );

    const dueTodayTasks = tasks.filter(
      (task) =>
        Boolean(task.due_date) &&
        task.status !== "done" &&
        task.due_date === today,
    );

    const completedThisWeek = tasks.filter(
      (task) =>
        task.status === "done" &&
        new Date(task.updated_at).getTime() >= oneWeekAgo.getTime(),
    );

    const assignedToMeTasks = tasks
      .filter((task) => task.assignee_id === user.id && task.status !== "done")
      .sort(sortByDueDateAsc)
      .slice(0, 6);

    const createdByMeTasks = tasks
      .filter((task) => task.created_by === user.id)
      .sort(sortByUpdatedDesc)
      .slice(0, 6);

    const upcomingDeadlines = tasks
      .filter(
        (task) =>
          Boolean(task.due_date) &&
          task.status !== "done" &&
          task.due_date! >= today,
      )
      .sort(sortByDueDateAsc)
      .slice(0, 6);

    const myCreatedTaskIds = tasks
      .filter((task) => task.created_by === user.id)
      .map((task) => task.id);

    const taskMap = new Map(tasks.map((task) => [task.id, task]));
    const projectNameMap = new Map(
      projects.map((project) => [project.id, project.name]),
    );

    let recentCommentsOnMyTasks: DashboardTaskCommentSummary[] = [];

    if (myCreatedTaskIds.length > 0) {
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
        .in("task_id", myCreatedTaskIds)
        .gte("created_at", rangeStartIso)
        .order("created_at", { ascending: false })
        .limit(6);

      if (commentsResult.error) {
        console.error(
          "GET /api/dashboard/overview comments error:",
          commentsResult.error,
        );
        throw commentsResult.error;
      }

      recentCommentsOnMyTasks = (commentsResult.data ?? []).map((comment) => {
        const task = taskMap.get(comment.task_id);

        return {
          ...comment,
          author: normalizeJoinedObject(comment.author),
          task_title: task?.title ?? "Untitled task",
          project_id: task?.project_id ?? "",
          project_name:
            projectNameMap.get(task?.project_id ?? "") ?? "Unknown project",
        };
      }) as DashboardTaskCommentSummary[];
    }

    const analyticsTasks = tasks.filter((task) => {
      const updatedAt = new Date(task.updated_at).getTime();
      return updatedAt >= rangeStart.getTime();
    });

    const activityCountByProject = projectIds.reduce<Record<string, number>>(
      (acc, id) => {
        acc[id] = 0;
        return acc;
      },
      {},
    );

    recentActivity.forEach((item) => {
      activityCountByProject[item.project_id] =
        (activityCountByProject[item.project_id] ?? 0) + 1;
    });

    analyticsTasks.forEach((task) => {
      activityCountByProject[task.project_id] =
        (activityCountByProject[task.project_id] ?? 0) + 1;
    });

    const projectSummaries: DashboardProjectSummary[] = projects.map(
      (project) => {
        const projectTasks = tasks.filter(
          (task) => task.project_id === project.id,
        );
        const totalTasks = projectTasks.length;
        const completedTasks = projectTasks.filter(
          (task) => task.status === "done",
        ).length;
        const openTasks = totalTasks - completedTasks;
        const overdueCount = projectTasks.filter(
          (task) =>
            Boolean(task.due_date) &&
            task.status !== "done" &&
            task.due_date! < today,
        ).length;

        const progress =
          totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        const activityTimes = [
          project.updated_at,
          ...projectTasks.map((task) => task.updated_at),
          ...recentActivity
            .filter((item) => item.project_id === project.id)
            .map((item) => item.created_at),
        ].filter(Boolean) as string[];

        const lastActivityAt = activityTimes.length
          ? [...activityTimes].sort(
              (a, b) => new Date(b).getTime() - new Date(a).getTime(),
            )[0]
          : null;

        return {
          project,
          totalTasks,
          openTasks,
          overdueTasks: overdueCount,
          completedTasks,
          membersCount: membersCountByProject[project.id] ?? 0,
          progress,
          activityCount: activityCountByProject[project.id] ?? 0,
          lastActivityAt,
        };
      },
    );

    const sortedByActivityDesc = [...projectSummaries].sort((a, b) => {
      if (b.activityCount !== a.activityCount)
        return b.activityCount - a.activityCount;
      return (
        new Date(b.lastActivityAt ?? 0).getTime() -
        new Date(a.lastActivityAt ?? 0).getTime()
      );
    });

    const sortedByActivityAsc = [...projectSummaries].sort((a, b) => {
      if (a.activityCount !== b.activityCount)
        return a.activityCount - b.activityCount;
      return (
        new Date(a.lastActivityAt ?? 0).getTime() -
        new Date(b.lastActivityAt ?? 0).getTime()
      );
    });

    const sortedByOverdueDesc = [...projectSummaries].sort((a, b) => {
      if (b.overdueTasks !== a.overdueTasks)
        return b.overdueTasks - a.overdueTasks;
      return b.openTasks - a.openTasks;
    });

    const mostActiveProject = sortedByActivityDesc[0] ?? null;
    const leastActiveProject = sortedByActivityAsc[0] ?? null;
    const mostOverdueProject =
      sortedByOverdueDesc[0] && sortedByOverdueDesc[0].overdueTasks > 0
        ? sortedByOverdueDesc[0]
        : null;

    const statusDistribution = {
      todo: tasks.filter((task) => task.status === "todo").length,
      in_progress: tasks.filter((task) => task.status === "in_progress").length,
      done: tasks.filter((task) => task.status === "done").length,
    };

    const completionMap = new Map<string, number>();
    const trendStart = getRangeStart(range);
    const trendEnd = new Date();
    trendEnd.setHours(0, 0, 0, 0);

    tasks
      .filter(
        (task) =>
          task.status === "done" &&
          new Date(task.updated_at).getTime() >= trendStart.getTime(),
      )
      .forEach((task) => {
        const key = formatDateLocal(new Date(task.updated_at));
        completionMap.set(key, (completionMap.get(key) ?? 0) + 1);
      });

    const completionTrend: DashboardCompletionTrendPoint[] = [];
    const cursor = new Date(trendStart);

    while (cursor.getTime() <= trendEnd.getTime()) {
      const key = formatDateLocal(cursor);
      completionTrend.push({
        date: key,
        completed: completionMap.get(key) ?? 0,
      });
      cursor.setDate(cursor.getDate() + 1);
    }

    const uniqueMembers = new Map<string, DashboardWorkloadMember>();

    members.forEach((member) => {
      const profile = member.profile;

      if (!profile || uniqueMembers.has(member.user_id)) return;

      const assignedTasks = tasks.filter(
        (task) => task.assignee_id === member.user_id && task.status !== "done",
      );

      const completedTasksByMember = tasks.filter(
        (task) =>
          task.assignee_id === member.user_id &&
          task.status === "done" &&
          new Date(task.updated_at).getTime() >= rangeStart.getTime(),
      );

      uniqueMembers.set(member.user_id, {
        user_id: member.user_id,
        name: profile.full_name || profile.email,
        email: profile.email,
        assignedTasks: assignedTasks.length,
        overdueTasks: assignedTasks.filter(
          (task) => Boolean(task.due_date) && task.due_date! < today,
        ).length,
        completedTasks: completedTasksByMember.length,
      });
    });

    const workloadByMember = [...uniqueMembers.values()].sort((a, b) => {
      if (b.assignedTasks !== a.assignedTasks)
        return b.assignedTasks - a.assignedTasks;
      if (b.overdueTasks !== a.overdueTasks)
        return b.overdueTasks - a.overdueTasks;
      return b.completedTasks - a.completedTasks;
    });

    const overview: DashboardOverview = {
      totalProjects: projects.length,
      overdueTasks: overdueTasks.length,
      dueToday: dueTodayTasks.length,
      completedThisWeek: completedThisWeek.length,
      assignedToMeTasks,
      createdByMeTasks,
      upcomingDeadlines,
      recentCommentsOnMyTasks,
      recentActivity: recentActivity.slice(0, 12),
      projectSummaries: projectSummaries.sort((a, b) => {
        if (b.overdueTasks !== a.overdueTasks)
          return b.overdueTasks - a.overdueTasks;
        if (b.activityCount !== a.activityCount)
          return b.activityCount - a.activityCount;
        return (
          new Date(b.lastActivityAt ?? 0).getTime() -
          new Date(a.lastActivityAt ?? 0).getTime()
        );
      }),
      workloadByMember,
      statusDistribution,
      completionTrend,
      mostActiveProject,
      leastActiveProject,
      mostOverdueProject,
    };

    return NextResponse.json<ApiResponse<DashboardOverview>>({
      data: overview,
      error: null,
    });
  } catch (err) {
    console.error("GET /api/dashboard/overview catch:", err);

    return NextResponse.json<ApiResponse<null>>(
      { data: null, error: "Failed to load dashboard overview" },
      { status: 500 },
    );
  }
}
