"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

function SunIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="block h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.75v2.5M12 18.75v2.5M21.25 12h-2.5M5.25 12H2.75M18.54 5.46l-1.77 1.77M7.23 16.77l-1.77 1.77M18.54 18.54l-1.77-1.77M7.23 7.23 5.46 5.46" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="block h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M20.2 15.05A8.25 8.25 0 0 1 8.95 3.8a8.25 8.25 0 1 0 11.25 11.25Z" />
    </svg>
  );
}

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const isClient = useIsClient();

  if (!isClient) {
    return (
      <div className="h-11 w-[100px] rounded-full border border-black/10 bg-black/5 dark:border-white/10 dark:bg-white/5" />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <div className="relative h-11.5 w-[100px] rounded-full border border-black/10 bg-black/5 p-1 backdrop-blur-xl dark:border-white/10 dark:bg-white/5">
      <motion.span
        initial={false}
        animate={{ x: isDark ? 46 : 0 }}
        transition={{ type: "spring", stiffness: 420, damping: 30 }}
        className={cn(
          "absolute left-2 top-1 h-9 w-[40px] rounded-full transition-shadow duration-200",
          isDark
            ? "bg-white/10 shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_12px_30px_rgba(255,255,255,0.06)]"
            : "bg-black/[0.06] shadow-[0_0_0_1px_rgba(15,23,42,0.06),0_12px_24px_rgba(15,23,42,0.08)]",
        )}
      />

      <div className="absolute inset-0 grid grid-cols-2 p-1">
        <button
          type="button"
          onClick={() => setTheme("light")}
          className={cn(
            "relative z-10 flex h-9 translate-x-[1.5px] items-center justify-center rounded-full text-[rgb(var(--muted-foreground))] transition-colors",
            !isDark && "text-[rgb(var(--foreground))]",
          )}
          aria-label="Switch to light mode"
        >
          <SunIcon />
        </button>

        <button
          type="button"
          onClick={() => setTheme("dark")}
          className={cn(
            "relative z-10 flex h-9 translate-x-[2px] items-center justify-center rounded-full text-[rgb(var(--muted-foreground))] transition-colors",
            isDark && "text-[rgb(var(--foreground))]",
          )}
          aria-label="Switch to dark mode"
        >
          <MoonIcon />
        </button>
      </div>
    </div>
  );
}
