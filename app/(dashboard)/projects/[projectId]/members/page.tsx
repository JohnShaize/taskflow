"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { useEffect, useMemo, useState } from "react";
import {
  useGetProjectByIdQuery,
  useGetProjectMembersQuery,
} from "@/services/projectsApi";
import { InviteMemberForm } from "@/components/projects/InviteMemberForm";
import { MemberList } from "@/components/projects/MemberList";
import { ProjectMember } from "@/types";

function TeamIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
      <circle cx="9.5" cy="7" r="3.25" />
      <path d="M20 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M14.5 4.13a3.25 3.25 0 0 1 0 5.74" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6l7-3Z" />
    </svg>
  );
}

function UserPlusIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M15 19a5 5 0 0 0-10 0" />
      <circle cx="10" cy="8" r="4" />
      <path d="M19 8v6M16 11h6" />
    </svg>
  );
}

export default function ProjectMembersPage() {
  const params = useParams<{ projectId: string }>();
  const projectId = params.projectId;
  const supabase = useMemo(() => createClient(), []);

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const {
    data: project,
    isLoading: projectLoading,
    error: projectError,
    refetch: refetchProject,
  } = useGetProjectByIdQuery(projectId, {
    skip: !projectId,
    refetchOnMountOrArgChange: true,
  });

  const {
    data: members = [],
    isLoading: membersLoading,
    error: membersError,
    refetch: refetchMembers,
  } = useGetProjectMembersQuery(projectId, {
    skip: !projectId,
    refetchOnMountOrArgChange: true,
  });

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setCurrentUserId(user?.id ?? null);
    }

    void loadUser();
  }, [supabase]);

  useEffect(() => {
    if (!projectId) return;

    const channel = supabase
      .channel(`project-members-${projectId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "project_members",
          filter: `project_id=eq.${projectId}`,
        },
        async () => {
          await refetchMembers();
          await refetchProject();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "projects",
          filter: `id=eq.${projectId}`,
        },
        async () => {
          await refetchProject();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [projectId, refetchMembers, refetchProject, supabase]);

  const currentMembership = members.find(
    (member: ProjectMember) => member.user_id === currentUserId,
  );

  const canManageMembers = currentMembership?.role === "admin";
  const adminCount = members.filter((member) => member.role === "admin").length;
  const memberCount = members.filter(
    (member) => member.role === "member",
  ).length;

  if (projectLoading || membersLoading || currentUserId === null) {
    return (
      <div className="tf-panel tf-noise rounded-[1.75rem] p-6">
        <p className="text-sm text-[rgb(var(--muted-foreground))]">
          Loading members...
        </p>
      </div>
    );
  }

  if (projectError || !project) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-red-300">
        Failed to load project.
      </div>
    );
  }

  if (membersError) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-red-300">
        Failed to load members.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="tf-panel tf-noise rounded-[1.85rem] p-5 sm:p-6 lg:p-7">
        <div className="flex flex-col gap-6 2xl:grid 2xl:grid-cols-[minmax(0,1.15fr)_minmax(620px,0.85fr)] 2xl:items-start 2xl:gap-8">
          <div className="max-w-4xl">
            <p className="tf-meta">Team access</p>

            <h1 className="mt-2 tf-heading text-3xl text-[rgb(var(--foreground))] sm:text-4xl">
              Members
            </h1>

            <p className="mt-3 text-[15px] leading-7 text-[rgb(var(--muted-foreground))]">
              Manage access, promote roles, and invite teammates into{" "}
              <span className="font-medium text-[rgb(var(--foreground))]">
                {project.name}
              </span>
              .
            </p>

            <p className="mt-2 text-sm text-[rgb(var(--muted-foreground))]">
              {project.description || "No project description added yet."}
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href={`/projects/${projectId}`}
                className="tf-btn-secondary px-4 py-3 text-sm font-medium"
              >
                Back to board
              </Link>

              <Link
                href={`/projects/${projectId}/settings`}
                className="tf-btn-secondary px-4 py-3 text-sm font-medium"
              >
                Settings
              </Link>

              <div className="tf-panel-soft inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm text-[rgb(var(--foreground))]">
                <span
                  className={`inline-flex h-2.5 w-2.5 rounded-full ${
                    canManageMembers
                      ? "bg-emerald-400 shadow-[0_0_14px_rgba(74,222,128,0.5)]"
                      : "bg-amber-400 shadow-[0_0_14px_rgba(251,191,36,0.45)]"
                  }`}
                />
                {canManageMembers ? "Admin access" : "Member view only"}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 2xl:w-full 2xl:gap-4">
            <div className="tf-panel-soft rounded-[1.4rem] p-4 lg:p-5 2xl:min-h-[150px]">
              <div className="flex items-center gap-3 2xl:h-full 2xl:flex-col 2xl:items-start 2xl:justify-between">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(var(--ring),0.16)] text-[rgb(var(--foreground))]">
                  <TeamIcon />
                </span>
                <div>
                  <p className="tf-meta">Total members</p>
                  <p className="mt-2 text-3xl font-semibold text-[rgb(var(--foreground))]">
                    {members.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="tf-panel-soft rounded-[1.4rem] p-4 lg:p-5 2xl:min-h-[150px]">
              <div className="flex items-center gap-3 2xl:h-full 2xl:flex-col 2xl:items-start 2xl:justify-between">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(var(--ring),0.16)] text-[rgb(var(--foreground))]">
                  <ShieldIcon />
                </span>
                <div>
                  <p className="tf-meta">Admins</p>
                  <p className="mt-2 text-3xl font-semibold text-[rgb(var(--foreground))]">
                    {adminCount}
                  </p>
                </div>
              </div>
            </div>

            <div className="tf-panel-soft rounded-[1.4rem] p-4 lg:p-5 2xl:min-h-[150px]">
              <div className="flex items-center gap-3 2xl:h-full 2xl:flex-col 2xl:items-start 2xl:justify-between">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(var(--ring),0.16)] text-[rgb(var(--foreground))]">
                  <UserPlusIcon />
                </span>
                <div>
                  <p className="tf-meta">Members</p>
                  <p className="mt-2 text-3xl font-semibold text-[rgb(var(--foreground))]">
                    {memberCount}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[0.88fr_1.12fr]">
        <InviteMemberForm
          projectId={projectId}
          canManageMembers={canManageMembers}
        />

        <MemberList
          projectId={projectId}
          members={members}
          currentUserId={currentUserId}
          projectOwnerId={project.owner_id}
          canManageMembers={canManageMembers}
        />
      </div>
    </div>
  );
}
