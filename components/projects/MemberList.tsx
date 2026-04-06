"use client";

import { cn } from "@/lib/utils";
import { ProjectMember, ProjectRole } from "@/types";
import {
  useRemoveMemberMutation,
  useUpdateMemberRoleMutation,
} from "@/services/projectsApi";
import { GlassSelect } from "@/components/ui/GlassSelect";

interface MemberListProps {
  projectId: string;
  members: ProjectMember[];
  currentUserId: string;
  projectOwnerId: string;
  canManageMembers: boolean;
}

const roleOptions = [
  { label: "Member", value: "member" },
  { label: "Admin", value: "admin" },
];

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

function getInitials(nameOrEmail: string) {
  const clean = nameOrEmail.trim();

  if (!clean) return "U";

  const parts = clean.split(" ").filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return clean.slice(0, 2).toUpperCase();
}

export function MemberList({
  projectId,
  members,
  currentUserId,
  projectOwnerId,
  canManageMembers,
}: MemberListProps) {
  const [updateMemberRole, { isLoading: isUpdating }] =
    useUpdateMemberRoleMutation();
  const [removeMember, { isLoading: isRemoving }] = useRemoveMemberMutation();

  async function handleRoleChange(memberId: string, role: ProjectRole) {
    try {
      await updateMemberRole({
        projectId,
        memberId,
        role,
      }).unwrap();
    } catch (err) {
      console.error("Role update error:", err);
    }
  }

  async function handleRemove(memberId: string) {
    try {
      await removeMember({
        projectId,
        memberId,
      }).unwrap();
    } catch (err) {
      console.error("Remove member error:", err);
    }
  }

  return (
    <div className="tf-panel tf-noise rounded-[1.75rem] p-5 sm:p-6">
      <div className="flex items-start gap-4">
        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[rgba(var(--ring),0.16)] text-[rgb(var(--foreground))]">
          <TeamIcon />
        </span>

        <div>
          <p className="tf-meta">Project roster</p>
          <h2 className="mt-2 tf-heading text-2xl text-[rgb(var(--foreground))]">
            Members
          </h2>
          <p className="mt-3 text-sm leading-7 text-[rgb(var(--muted-foreground))]">
            View team members, update permissions, and keep access aligned with
            how the project is being used.
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {members.length === 0 ? (
          <div className="tf-panel-soft rounded-[1.35rem] p-5">
            <p className="text-sm text-[rgb(var(--muted-foreground))]">
              No members found.
            </p>
          </div>
        ) : (
          members.map((member) => {
            const isOwner = member.user_id === projectOwnerId;
            const isCurrentUser = member.user_id === currentUserId;
            const displayName =
              member.profile.full_name || member.profile.email;

            return (
              <div
                key={member.id}
                className="tf-panel-soft rounded-[1.35rem] p-4 sm:p-5"
              >
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div className="flex min-w-0 items-start gap-4">
                    <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[rgba(var(--ring),0.16)] text-sm font-semibold text-[rgb(var(--foreground))] shadow-[0_10px_28px_rgba(99,102,241,0.22)]">
                      {getInitials(displayName)}
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-[15px] font-semibold text-[rgb(var(--foreground))]">
                          {displayName}
                        </p>

                        {isOwner && (
                          <span className="rounded-full bg-blue-500/15 px-2.5 py-1 text-[11px] font-medium text-blue-300">
                            Owner
                          </span>
                        )}

                        {isCurrentUser && (
                          <span className="rounded-full bg-black/[0.06] px-2.5 py-1 text-[11px] font-medium text-[rgb(var(--foreground))] dark:bg-white/[0.08]">
                            You
                          </span>
                        )}
                      </div>

                      <p className="mt-1 truncate text-sm text-[rgb(var(--muted-foreground))]">
                        {member.profile.email}
                      </p>

                      <p className="mt-3 tf-meta">
                        Joined {new Date(member.joined_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center xl:justify-end">
                    {canManageMembers && !isOwner ? (
                      <>
                        <div className="w-full sm:min-w-[170px] xl:w-[170px]">
                          <GlassSelect
                            value={member.role}
                            disabled={isUpdating}
                            onChange={(value: string) =>
                              handleRoleChange(member.id, value as ProjectRole)
                            }
                            options={roleOptions}
                          />
                        </div>

                        <button
                          type="button"
                          disabled={isRemoving}
                          onClick={() => handleRemove(member.id)}
                          className="inline-flex items-center justify-center rounded-[1rem] border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-300 transition-colors hover:bg-red-500/15 disabled:opacity-50"
                        >
                          Remove
                        </button>
                      </>
                    ) : (
                      <span
                        className={cn(
                          "inline-flex w-fit items-center justify-center rounded-full px-3 py-2 text-sm font-medium capitalize",
                          member.role === "admin"
                            ? "bg-blue-500/15 text-blue-300"
                            : "bg-black/[0.06] text-[rgb(var(--foreground))] dark:bg-white/[0.08]",
                        )}
                      >
                        {member.role}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
