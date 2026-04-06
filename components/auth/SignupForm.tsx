"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { useAppDispatch } from "@/store/hooks";
import { setUser } from "@/store/slices/authSlice";

export function SignupForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
      return;
    }

    if (data.user) {
      dispatch(
        setUser({
          id: data.user.id,
          email: data.user.email ?? "",
          full_name:
            typeof data.user.user_metadata?.full_name === "string"
              ? data.user.user_metadata.full_name
              : fullName,
          avatar_url:
            typeof data.user.user_metadata?.avatar_url === "string"
              ? data.user.user_metadata.avatar_url
              : null,
          created_at: data.user.created_at,
        }),
      );
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="tf-meta mb-2 block">Full Name</label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          className="w-full rounded-[1.15rem] border border-black/6 bg-black/[0.03] px-4 py-3 text-[rgb(var(--foreground))] outline-none transition-all duration-200 placeholder:text-[rgb(var(--muted-foreground))] focus:border-black/12 focus:bg-black/[0.045] dark:border-white/10 dark:bg-white/[0.03] dark:focus:border-white/16 dark:focus:bg-white/[0.045]"
          placeholder="John Doe"
        />
      </div>

      <div>
        <label className="tf-meta mb-2 block">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded-[1.15rem] border border-black/6 bg-black/[0.03] px-4 py-3 text-[rgb(var(--foreground))] outline-none transition-all duration-200 placeholder:text-[rgb(var(--muted-foreground))] focus:border-black/12 focus:bg-black/[0.045] dark:border-white/10 dark:bg-white/[0.03] dark:focus:border-white/16 dark:focus:bg-white/[0.045]"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label className="tf-meta mb-2 block">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="w-full rounded-[1.15rem] border border-black/6 bg-black/[0.03] px-4 py-3 text-[rgb(var(--foreground))] outline-none transition-all duration-200 placeholder:text-[rgb(var(--muted-foreground))] focus:border-black/12 focus:bg-black/[0.045] dark:border-white/10 dark:bg-white/[0.03] dark:focus:border-white/16 dark:focus:bg-white/[0.045]"
          placeholder="••••••••"
        />
      </div>

      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="inline-flex w-full items-center justify-center rounded-[1rem] bg-[rgb(var(--foreground))] px-4 py-3 text-sm font-medium text-[rgb(var(--background))] transition-all duration-200 hover:opacity-92 disabled:opacity-50"
      >
        {isLoading ? "Creating account..." : "Create account"}
      </button>

      <p className="text-center text-sm text-[rgb(var(--muted-foreground))]">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-[rgb(var(--foreground))] underline underline-offset-4"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
