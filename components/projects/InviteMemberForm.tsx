"use client";

import { useState } from "react";
import { ProjectRole } from "@/types";
import { useInviteMemberMutation } from "@/services/projectsApi";
import { GlassSelect } from "@/components/ui/GlassSelect";

interface InviteMemberFormProps {
  projectId: string;
  canManageMembers: boolean;
}

const roleOptions = [
  { label: "Member", value: "member" },
  { label: "Admin", value: "admin" },
];

function LockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <rect x="4" y="11" width="16" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 1 1 8 0v3" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M4 6h16v12H4z" />
      <path d="m4 8 8 6 8-6" />
    </svg>
  );
}

export function InviteMemberForm({
  projectId,
  canManageMembers,
}: InviteMemberFormProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<ProjectRole>("member");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [inviteMember, { isLoading }] = useInviteMemberMutation();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      await inviteMember({
        projectId,
        email,
        role,
      }).unwrap();

      setEmail("");
      setRole("member");
      setSuccess("Member invited successfully.");
    } catch (err: unknown) {
      console.error("Invite member error:", err);

      const message =
        typeof err === "object" &&
        err !== null &&
        "data" in err &&
        typeof (err as { data?: { error?: string } }).data?.error === "string"
          ? (err as { data: { error: string } }).data.error
          : "Failed to invite member.";

      setError(message);
    }
  }

  if (!canManageMembers) {
    return (
      <div className="tf-panel tf-noise rounded-[1.75rem] p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[rgba(var(--ring),0.16)] text-[rgb(var(--foreground))]">
            <LockIcon />
          </span>

          <div>
            <p className="tf-meta">Access control</p>
            <h2 className="mt-2 tf-heading text-2xl text-[rgb(var(--foreground))]">
              Invite restricted
            </h2>
            <p className="mt-3 text-sm leading-7 text-[rgb(var(--muted-foreground))]">
              Only project admins can invite new members or assign elevated
              roles. You can still view the current team list on this page.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tf-panel tf-noise rounded-[1.75rem] p-5 sm:p-6">
      <div className="flex items-start gap-4">
        <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[rgba(var(--ring),0.16)] text-[rgb(var(--foreground))]">
          <MailIcon />
        </span>

        <div>
          <p className="tf-meta">Invite workflow</p>
          <h2 className="mt-2 tf-heading text-2xl text-[rgb(var(--foreground))]">
            Invite Member
          </h2>
          <p className="mt-3 text-sm leading-7 text-[rgb(var(--muted-foreground))]">
            Add an existing TaskFlow user to this project and choose the access
            level they should start with.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <label className="tf-meta mb-2 block">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="tf-input"
            placeholder="member@example.com"
          />
        </div>

        <div>
          <label className="tf-meta mb-2 block">Role</label>
          <GlassSelect
            value={role}
            onChange={(value: string) => setRole(value as ProjectRole)}
            options={roleOptions}
          />
        </div>

        {error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="tf-btn-primary w-full px-4 py-3 text-sm font-medium disabled:opacity-50"
        >
          {isLoading ? "Inviting..." : "Invite Member"}
        </button>
      </form>
    </div>
  );
}
