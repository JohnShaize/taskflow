"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearUser } from "@/store/slices/authSlice";
import { setProjects, setActiveProject } from "@/store/slices/projectSlice";
import { setTasks, clearFilters } from "@/store/slices/boardSlice";
import { toggleSidebar } from "@/store/slices/uiSlice";
import { projectsApi } from "@/services/projectsApi";
import { tasksApi } from "@/services/tasksApi";

function MenuIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
    >
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function Header() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const authIsLoading = useAppSelector((state) => state.auth.isLoading);
  const supabase = createClient();

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 18);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

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

  return (
    <motion.header
      initial={{ opacity: 0, y: -14, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.42, ease: "easeOut" }}
      className="sticky top-0 z-30 px-3 pt-3 transition-colors duration-300 sm:px-6 sm:pt-5 lg:px-8"
      style={{
        backgroundColor: "rgb(var(--panel))",
      }}
    >
      <div
        className={cn(
          "tf-chrome overflow-hidden rounded-[1.75rem] px-4 py-3 transition-all duration-300 sm:px-5",
          isScrolled
            ? "shadow-[0_18px_60px_rgba(15,23,42,0.18)] dark:shadow-[0_28px_80px_rgba(0,0,0,0.58)]"
            : "shadow-[0_10px_30px_rgba(15,23,42,0.08)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.28)]",
        )}
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-start gap-3 md:items-center">
            <button
              type="button"
              onClick={() => dispatch(toggleSidebar())}
              className="tf-btn-secondary inline-flex h-10 w-10 shrink-0 items-center justify-center p-0 xl:hidden"
              aria-label="Open sidebar"
            >
              <MenuIcon />
            </button>

            <div className="min-w-0">
              <p className="tf-meta">Live workspace</p>
              <p className="truncate text-lg font-semibold text-[rgb(var(--foreground))] sm:text-[15px] md:text-base">
                Welcome back{user?.full_name ? `, ${user.full_name}` : ""}
              </p>
            </div>
          </div>

          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center md:flex-none md:justify-end">
            <div className="min-w-0">
              {authIsLoading ? (
                <div className="h-11 w-full min-w-[180px] rounded-full border border-black/5 bg-black/[0.04] dark:border-white/10 dark:bg-white/[0.04] sm:w-[220px]" />
              ) : user?.email ? (
                <div className="truncate rounded-full border border-black/5 bg-black/[0.04] px-4 py-3 text-sm text-[rgb(var(--muted-foreground))] dark:border-white/10 dark:bg-white/[0.04] sm:w-[220px] sm:px-3 sm:py-2 sm:text-xs">
                  {user.email}
                </div>
              ) : null}
            </div>

            <div className="flex items-center gap-3">
              <ThemeToggle />

              <button
                onClick={handleLogout}
                className="tf-btn-secondary min-w-[112px] px-4 py-3 text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
