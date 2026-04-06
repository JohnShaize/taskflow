"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearUser, setUser } from "@/store/slices/authSlice";
import { setProjects, setActiveProject } from "@/store/slices/projectSlice";
import { setTasks, clearFilters } from "@/store/slices/boardSlice";
import { projectsApi } from "@/services/projectsApi";
import { tasksApi } from "@/services/tasksApi";

interface ProfileRow {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

interface AccountState {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string;
  createdAt: string | null;
}

function UserIcon() {
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

function PaletteIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M12 3a9 9 0 1 0 0 18h1.2a2.3 2.3 0 0 0 0-4.6h-1.1a1.8 1.8 0 0 1 0-3.6H15A6 6 0 0 0 15 3h-3Z" />
      <circle cx="7.5" cy="10" r="1" />
      <circle cx="12" cy="7.5" r="1" />
      <circle cx="16.5" cy="10" r="1" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M15 17l5-5-5-5" />
      <path d="M20 12H9" />
      <path d="M11 20H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5" />
    </svg>
  );
}

function formatJoinedDate(value: string | null) {
  if (!value) return "—";

  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getInitials(name: string, email: string) {
  const base = name.trim() || email.trim();
  const parts = base.split(" ").filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return base.slice(0, 2).toUpperCase();
}

export default function SettingsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const supabase = useMemo(() => createClient(), []);
  const authUser = useAppSelector((state) => state.auth.user);

  const [account, setAccount] = useState<AccountState | null>(() =>
    authUser
      ? {
          id: authUser.id,
          email: authUser.email,
          fullName: authUser.full_name ?? "",
          avatarUrl: authUser.avatar_url ?? "",
          createdAt: authUser.created_at ?? null,
        }
      : null,
  );

  const [isBootstrapping, setIsBootstrapping] = useState(() => !authUser);

  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [securityError, setSecurityError] = useState<string | null>(null);
  const [securityMessage, setSecurityMessage] = useState<string | null>(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadAccount() {
      setIsBootstrapping(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (cancelled) return;

      if (!user) {
        setAccount(null);
        setIsBootstrapping(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("id, email, full_name, avatar_url, created_at")
        .eq("id", user.id)
        .maybeSingle<ProfileRow>();

      if (cancelled) return;

      const resolvedAccount: AccountState = {
        id: user.id,
        email: profile?.email ?? user.email ?? "",
        fullName:
          profile?.full_name ??
          (typeof user.user_metadata?.full_name === "string"
            ? user.user_metadata.full_name
            : "") ??
          "",
        avatarUrl:
          profile?.avatar_url ??
          (typeof user.user_metadata?.avatar_url === "string"
            ? user.user_metadata.avatar_url
            : "") ??
          "",
        createdAt:
          profile?.created_at ??
          (authUser?.id === user.id ? authUser.created_at : null) ??
          null,
      };

      setAccount(resolvedAccount);
      setIsBootstrapping(false);
    }

    void loadAccount();

    return () => {
      cancelled = true;
    };
  }, [supabase, authUser]);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();

    if (!account) return;

    setProfileError(null);
    setProfileMessage(null);

    const trimmedName = account.fullName.trim();
    const trimmedAvatar = account.avatarUrl.trim();

    if (!trimmedName) {
      setProfileError("Full name is required.");
      return;
    }

    setIsSavingProfile(true);

    try {
      const { error: profileUpdateError } = await supabase
        .from("profiles")
        .update({
          full_name: trimmedName,
          avatar_url: trimmedAvatar || null,
        })
        .eq("id", account.id);

      if (profileUpdateError) {
        throw profileUpdateError;
      }

      const { error: authUpdateError } = await supabase.auth.updateUser({
        data: {
          full_name: trimmedName,
          avatar_url: trimmedAvatar || null,
        },
      });

      if (authUpdateError) {
        throw authUpdateError;
      }

      const updatedAccount: AccountState = {
        ...account,
        fullName: trimmedName,
        avatarUrl: trimmedAvatar,
      };

      setAccount(updatedAccount);

      dispatch(
        setUser({
          id: updatedAccount.id,
          email: updatedAccount.email,
          full_name: updatedAccount.fullName,
          avatar_url: updatedAccount.avatarUrl || null,
          created_at: updatedAccount.createdAt ?? new Date().toISOString(),
        }),
      );

      setProfileMessage("Profile updated successfully.");
    } catch (error) {
      console.error("Profile update error:", error);
      setProfileError("Failed to update profile. Please try again.");
    } finally {
      setIsSavingProfile(false);
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();

    setSecurityError(null);
    setSecurityMessage(null);

    if (newPassword.length < 6) {
      setSecurityError("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setSecurityError("Passwords do not match.");
      return;
    }

    setIsUpdatingPassword(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }

      setNewPassword("");
      setConfirmPassword("");
      setSecurityMessage("Password updated successfully.");
    } catch (error) {
      console.error("Password update error:", error);
      setSecurityError("Failed to update password. Please try again.");
    } finally {
      setIsUpdatingPassword(false);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();

    dispatch(clearUser());
    dispatch(setProjects([]));
    dispatch(setActiveProject(null));
    dispatch(setTasks([]));
    dispatch(clearFilters());

    dispatch(projectsApi.util.resetApiState());
    dispatch(tasksApi.util.resetApiState());

    router.push("/login");
    router.refresh();
  }

  const initialLoading = isBootstrapping && !account;
  const isRefreshing = isBootstrapping && !!account;

  if (initialLoading) {
    return (
      <div className="space-y-6">
        <section className="tf-panel tf-noise rounded-[1.85rem] p-6">
          <p className="tf-meta">Account center</p>
          <h1 className="mt-2 tf-heading text-3xl text-[rgb(var(--foreground))] sm:text-4xl">
            Settings
          </h1>
          <p className="mt-4 text-sm text-[rgb(var(--muted-foreground))]">
            Loading your account settings...
          </p>
        </section>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-red-300">
        Unable to load your account.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="tf-panel tf-noise rounded-[1.85rem] p-5 sm:p-6 lg:p-7">
        <div className="flex flex-col gap-6 2xl:grid 2xl:grid-cols-[minmax(0,1.12fr)_minmax(560px,0.88fr)] 2xl:items-start 2xl:gap-8">
          <div className="max-w-4xl">
            <p className="tf-meta">Account center</p>

            <h1 className="mt-2 tf-heading text-3xl text-[rgb(var(--foreground))] sm:text-4xl">
              Settings
            </h1>

            <p className="mt-3 text-[15px] leading-7 text-[rgb(var(--muted-foreground))]">
              Manage your profile details, security preferences, workspace
              appearance, and active account session.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <div className="tf-panel-soft inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm text-[rgb(var(--foreground))]">
                <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(74,222,128,0.5)]" />
                Protected account workspace
              </div>

              {isRefreshing && (
                <div className="tf-panel-soft inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm text-[rgb(var(--muted-foreground))]">
                  <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  Refreshing
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-2 2xl:gap-4">
            <div className="tf-panel-soft rounded-[1.4rem] p-4 lg:p-5">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(var(--ring),0.16)] text-[rgb(var(--foreground))]">
                  <UserIcon />
                </span>

                <div>
                  <p className="tf-meta">Account email</p>
                  <p className="mt-2 text-sm font-medium text-[rgb(var(--foreground))]">
                    {account.email}
                  </p>
                </div>
              </div>
            </div>

            <div className="tf-panel-soft rounded-[1.4rem] p-4 lg:p-5">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(var(--ring),0.16)] text-[rgb(var(--foreground))]">
                  <ShieldIcon />
                </span>

                <div>
                  <p className="tf-meta">Member since</p>
                  <p className="mt-2 text-sm font-medium text-[rgb(var(--foreground))]">
                    {formatJoinedDate(account.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section className="tf-panel tf-noise rounded-[1.75rem] p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <div className="inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.5rem] bg-[rgba(var(--ring),0.18)] text-lg font-semibold text-[rgb(var(--foreground))] shadow-[0_10px_28px_rgba(99,102,241,0.18)]">
              {getInitials(account.fullName, account.email)}
            </div>

            <div className="min-w-0">
              <p className="tf-meta">Profile preview</p>
              <h2 className="mt-2 tf-heading text-2xl text-[rgb(var(--foreground))]">
                {account.fullName || "Your profile"}
              </h2>
              <p className="mt-2 truncate text-sm text-[rgb(var(--muted-foreground))]">
                {account.email}
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="mt-6 space-y-5">
            <div>
              <label className="tf-meta mb-2 block">Full name</label>
              <input
                type="text"
                value={account.fullName}
                onChange={(e) =>
                  setAccount((prev) =>
                    prev ? { ...prev, fullName: e.target.value } : prev,
                  )
                }
                className="tf-input"
                placeholder="Your full name"
                required
              />
            </div>

            <div>
              <label className="tf-meta mb-2 block">Avatar URL</label>
              <input
                type="url"
                value={account.avatarUrl}
                onChange={(e) =>
                  setAccount((prev) =>
                    prev ? { ...prev, avatarUrl: e.target.value } : prev,
                  )
                }
                className="tf-input"
                placeholder="https://example.com/avatar.jpg"
              />
            </div>

            <div>
              <label className="tf-meta mb-2 block">Email</label>
              <input
                type="email"
                value={account.email}
                className="tf-input opacity-80"
                disabled
              />
              <p className="mt-2 text-xs text-[rgb(var(--muted-foreground))]">
                Email is shown here for reference. A verified email-change flow
                can be added later.
              </p>
            </div>

            {profileError && (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {profileError}
              </div>
            )}

            {profileMessage && (
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                {profileMessage}
              </div>
            )}

            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <button
                type="submit"
                disabled={isSavingProfile}
                className="tf-btn-primary flex-1 px-4 py-3 text-sm font-medium disabled:opacity-50"
              >
                {isSavingProfile ? "Saving profile..." : "Save profile"}
              </button>
            </div>
          </form>
        </section>

        <div className="space-y-6">
          <section className="tf-panel tf-noise rounded-[1.75rem] p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(var(--ring),0.16)] text-[rgb(var(--foreground))]">
                <PaletteIcon />
              </span>

              <div>
                <p className="tf-meta">Appearance</p>
                <h2 className="mt-1 text-lg font-semibold text-[rgb(var(--foreground))]">
                  Theme
                </h2>
              </div>
            </div>

            <p className="mt-4 text-sm leading-7 text-[rgb(var(--muted-foreground))]">
              Switch between dark and light mode for your workspace.
            </p>

            <div className="mt-5">
              <ThemeToggle />
            </div>
          </section>

          <section className="tf-panel tf-noise rounded-[1.75rem] p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[rgba(var(--ring),0.16)] text-[rgb(var(--foreground))]">
                <ShieldIcon />
              </span>

              <div>
                <p className="tf-meta">Security</p>
                <h2 className="mt-1 text-lg font-semibold text-[rgb(var(--foreground))]">
                  Change password
                </h2>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="mt-5 space-y-4">
              <div>
                <label className="tf-meta mb-2 block">New password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="tf-input"
                  placeholder="Enter a new password"
                />
              </div>

              <div>
                <label className="tf-meta mb-2 block">Confirm password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="tf-input"
                  placeholder="Confirm new password"
                />
              </div>

              {securityError && (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {securityError}
                </div>
              )}

              {securityMessage && (
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                  {securityMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isUpdatingPassword}
                className="tf-btn-secondary w-full px-4 py-3 text-sm font-medium disabled:opacity-50"
              >
                {isUpdatingPassword
                  ? "Updating password..."
                  : "Update password"}
              </button>
            </form>
          </section>

          <section className="tf-panel tf-noise rounded-[1.75rem] p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-red-500/15 text-red-300">
                <LogoutIcon />
              </span>

              <div>
                <p className="tf-meta">Session</p>
                <h2 className="mt-1 text-lg font-semibold text-[rgb(var(--foreground))]">
                  Log out
                </h2>
              </div>
            </div>

            <p className="mt-4 text-sm leading-7 text-[rgb(var(--muted-foreground))]">
              End your current session on this device and return to the login
              page.
            </p>

            <button
              type="button"
              onClick={handleLogout}
              className="mt-5 w-full rounded-[1rem] bg-red-500/15 px-4 py-3 text-sm font-medium text-red-300 transition-colors hover:bg-red-500/20"
            >
              Log out
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
