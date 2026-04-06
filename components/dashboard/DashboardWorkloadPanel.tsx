import { DashboardWorkloadMember, DashboardDateRange } from "@/types";

interface DashboardWorkloadPanelProps {
  members: DashboardWorkloadMember[];
  range: DashboardDateRange;
}

export function DashboardWorkloadPanel({
  members,
  range,
}: DashboardWorkloadPanelProps) {
  return (
    <section className="tf-panel tf-noise rounded-[1.75rem] p-5 sm:p-6">
      <p className="tf-meta">Team balance</p>
      <h2 className="mt-2 tf-heading text-2xl text-[rgb(var(--foreground))]">
        Workload by member
      </h2>
      <p className="mt-3 text-sm leading-7 text-[rgb(var(--muted-foreground))]">
        Open assignments, overdue work, and completed tasks in the selected{" "}
        {range === "7d" ? "7-day" : range === "30d" ? "30-day" : "90-day"}{" "}
        window.
      </p>

      <div className="mt-6 space-y-3">
        {members.length === 0 ? (
          <div className="tf-panel-soft rounded-[1.35rem] p-5">
            <p className="text-base font-medium text-[rgb(var(--foreground))]">
              No member workload yet
            </p>
            <p className="mt-2 text-sm text-[rgb(var(--muted-foreground))]">
              Invite teammates or assign tasks to start tracking distribution.
            </p>
          </div>
        ) : (
          members.map((member) => (
            <div
              key={member.user_id}
              className="tf-panel-soft rounded-[1.35rem] p-4"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[rgb(var(--foreground))]">
                    {member.name}
                  </p>
                  <p className="mt-1 text-xs text-[rgb(var(--muted-foreground))]">
                    {member.email}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3 sm:min-w-[360px]">
                  <div className="rounded-2xl bg-black/[0.05] px-4 py-3 dark:bg-white/[0.06]">
                    <p className="tf-meta">Assigned</p>
                    <p className="mt-2 text-xl font-semibold text-[rgb(var(--foreground))]">
                      {member.assignedTasks}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-black/[0.05] px-4 py-3 dark:bg-white/[0.06]">
                    <p className="tf-meta">Overdue</p>
                    <p className="mt-2 text-xl font-semibold text-red-300">
                      {member.overdueTasks}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-black/[0.05] px-4 py-3 dark:bg-white/[0.06]">
                    <p className="tf-meta">Completed</p>
                    <p className="mt-2 text-xl font-semibold text-[rgb(var(--foreground))]">
                      {member.completedTasks}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
