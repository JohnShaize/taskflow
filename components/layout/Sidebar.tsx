"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { toggleSidebar, setSidebarOpen } from "@/store/slices/uiSlice";
import { cn } from "@/lib/utils";

function DashboardIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="5" rx="1.5" />
      <rect x="13.5" y="10.5" width="7" height="10" rx="1.5" />
      <rect x="3.5" y="12.5" width="7" height="8" rx="1.5" />
    </svg>
  );
}

function ProjectsIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M4 7.5h16M8 4v7M16 4v7M5.5 12.5h13a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2Z" />
    </svg>
  );
}

function MyTasksIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M9 6h10" />
      <path d="M9 12h10" />
      <path d="M9 18h10" />
      <path d="m4.5 6 1.5 1.5L7.8 5.7" />
      <path d="m4.5 12 1.5 1.5L7.8 11.7" />
      <path d="m4.5 18 1.5 1.5L7.8 17.7" />
    </svg>
  );
}

function InboxIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-9Z" />
      <path d="M4 13h4l1.5 2h5L16 13h4" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[18px] w-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="12" cy="12" r="3.2" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .7 1.7 1.7 0 0 1-2.92 0 1.7 1.7 0 0 0-1-.7 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.7-1 1.7 1.7 0 0 1 0-2.92 1.7 1.7 0 0 0 .7-1 1.7 1.7 0 0 0-.34-1.87l-.06-.06A2 2 0 1 1 7.03 5.3l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.7 1.7 1.7 0 0 1 2.92 0 1.7 1.7 0 0 0 1 .7 1.7 1.7 0 0 0 1.87-.34l.06-.06A2 2 0 0 1 18.68 7l-.06.06A1.7 1.7 0 0 0 19.4 9a1.7 1.7 0 0 0 .7 1 1.7 1.7 0 0 1 0 2.92 1.7 1.7 0 0 0-.7 1Z" />
    </svg>
  );
}

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: DashboardIcon },
  { label: "Projects", href: "/projects", icon: ProjectsIcon },
  { label: "My Tasks", href: "/my-tasks", icon: MyTasksIcon },
  { label: "Inbox", href: "/inbox", icon: InboxIcon },
  { label: "Settings", href: "/settings", icon: SettingsIcon },
];

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.ui.isSidebarOpen);

  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const isClient = useIsClient();

  const portalNode = useMemo(() => {
    if (!isClient) return null;

    const el = document.createElement("div");
    el.style.cssText =
      "position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9998;";
    return el;
  }, [isClient]);

  useEffect(() => {
    if (!portalNode) return;

    document.body.appendChild(portalNode);

    return () => {
      if (portalNode.parentNode) {
        portalNode.parentNode.removeChild(portalNode);
      }
    };
  }, [portalNode]);

  useEffect(() => {
    if (!isClient) return;

    const mediaQuery = window.matchMedia("(max-width: 1279px)");

    const handleViewportChange = () => {
      const isMobile = mediaQuery.matches;
      setIsMobileViewport(isMobile);

      if (isMobile) {
        dispatch(setSidebarOpen(false));
      }
    };

    handleViewportChange();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleViewportChange);
    } else {
      mediaQuery.addListener(handleViewportChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleViewportChange);
      } else {
        mediaQuery.removeListener(handleViewportChange);
      }
    };
  }, [dispatch, isClient]);

  const isCollapsed = !isOpen;
  const desktopWidthClass = isCollapsed ? "xl:w-[6.25rem]" : "xl:w-[17.5rem]";

  const desktopSidebar = portalNode
    ? createPortal(
        <aside
          style={{ pointerEvents: "auto" }}
          className={cn(
            "tf-chrome fixed left-0 top-0 z-[9999] hidden h-[100dvh] flex-col border-r border-white/10 transition-all duration-300 xl:flex",
            desktopWidthClass,
          )}
        >
          <div
            className={cn(
              "border-b border-black/5 px-3 py-4 dark:border-white/10",
              isCollapsed
                ? "flex flex-col items-center gap-3"
                : "flex items-center justify-between",
            )}
          >
            <div
              className={cn(
                "flex min-w-0 items-center",
                isCollapsed ? "justify-center" : "gap-3",
              )}
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-base font-semibold text-[rgb(var(--foreground))] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] dark:bg-white/[0.03]">
                TF
              </div>

              {!isCollapsed && (
                <div className="min-w-0 overflow-hidden">
                  <p className="tf-heading text-lg text-[rgb(var(--foreground))]">
                    TaskFlow
                  </p>
                  <p className="tf-meta">pro workspace</p>
                </div>
              )}
            </div>

            {!isCollapsed ? (
              <button
                onClick={() => dispatch(toggleSidebar())}
                className="tf-btn-secondary inline-flex h-10 w-10 items-center justify-center p-0"
                aria-label="Collapse sidebar"
              >
                <span className="text-lg leading-none">←</span>
              </button>
            ) : (
              <button
                onClick={() => dispatch(setSidebarOpen(true))}
                className="tf-btn-secondary inline-flex h-10 w-10 items-center justify-center p-0"
                aria-label="Expand sidebar"
              >
                <span className="text-lg leading-none">→</span>
              </button>
            )}
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4">
            <div className="space-y-2">
              {navItems.map((item, index) => {
                const isActive =
                  item.href === "/projects"
                    ? pathname.startsWith("/projects")
                    : pathname.startsWith(item.href);

                const Icon = item.icon;

                return (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.04 * index }}
                  >
                    <Link
                      href={item.href}
                      className={cn(
                        "tf-backlit group relative flex items-center overflow-hidden rounded-2xl px-3 py-3 transition-all duration-200",
                        isCollapsed ? "justify-center px-2" : "gap-3",
                        isActive
                          ? "border border-white/10 bg-white/[0.08] text-white dark:bg-white/[0.05]"
                          : "border border-transparent text-[rgb(var(--muted-foreground))] hover:border-black/5 hover:bg-black/[0.04] hover:text-[rgb(var(--foreground))] dark:hover:border-white/10 dark:hover:bg-white/[0.03]",
                      )}
                      data-active={isActive}
                    >
                      <span
                        className={cn(
                          "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition-all duration-200",
                          isActive
                            ? "bg-white text-black shadow-[0_10px_30px_rgba(255,255,255,0.22)] dark:bg-white dark:text-black"
                            : "bg-black/[0.04] text-current dark:bg-white/[0.03]",
                        )}
                      >
                        <Icon />
                      </span>

                      {!isCollapsed && (
                        <span className="overflow-hidden text-sm font-medium">
                          {item.label}
                        </span>
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </nav>
        </aside>,
        portalNode,
      )
    : null;

  const mobileSidebar =
    isMobileViewport && portalNode
      ? createPortal(
          <AnimatePresence>
            {isOpen && (
              <>
                <motion.button
                  key="backdrop"
                  type="button"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.22 }}
                  onClick={() => dispatch(setSidebarOpen(false))}
                  aria-label="Close sidebar"
                  style={{ pointerEvents: "auto" }}
                  className="absolute inset-0 cursor-default bg-black/50 backdrop-blur-sm"
                />

                <motion.aside
                  key="drawer"
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                  style={{ pointerEvents: "auto" }}
                  className="absolute inset-y-0 left-0 flex w-[17rem] flex-col overflow-hidden rounded-r-[2rem] border-r border-white/[0.08] bg-[rgba(var(--panel),0.82)] shadow-[4px_0_48px_rgba(0,0,0,0.45)] backdrop-blur-xl"
                >
                  <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                  <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-base font-semibold text-[rgb(var(--foreground))] shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] dark:bg-white/[0.05]">
                        TF
                      </div>
                      <div className="min-w-0 overflow-hidden">
                        <p className="tf-heading text-[17px] leading-tight text-[rgb(var(--foreground))]">
                          TaskFlow
                        </p>
                        <p className="tf-meta mt-0.5">pro workspace</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => dispatch(setSidebarOpen(false))}
                      aria-label="Close sidebar"
                      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04] text-[rgb(var(--muted-foreground))] transition-all duration-200 hover:border-white/[0.14] hover:bg-white/[0.08] hover:text-[rgb(var(--foreground))]"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="h-[17px] w-[17px]"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      >
                        <path d="M4 7h16M4 12h16M4 17h16" />
                      </svg>
                    </button>
                  </div>

                  <nav className="flex-1 px-3 py-4">
                    <div className="space-y-1.5">
                      {navItems.map((item, index) => {
                        const isActive =
                          item.href === "/projects"
                            ? pathname.startsWith("/projects")
                            : pathname.startsWith(item.href);
                        const Icon = item.icon;

                        return (
                          <motion.div
                            key={item.href}
                            initial={{ opacity: 0, x: -14 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{
                              delay: 0.08 + 0.06 * index,
                              duration: 0.24,
                            }}
                          >
                            <Link
                              href={item.href}
                              onClick={() => dispatch(setSidebarOpen(false))}
                              data-active={isActive}
                              className={cn(
                                "tf-backlit group relative flex items-center gap-3 overflow-hidden rounded-2xl px-3 py-3 transition-all duration-200",
                                isActive
                                  ? "border border-white/10 bg-white/[0.09] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                                  : "border border-transparent text-[rgb(var(--muted-foreground))] hover:border-white/[0.07] hover:bg-white/[0.04] hover:text-[rgb(var(--foreground))]",
                              )}
                            >
                              <span
                                className={cn(
                                  "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition-all duration-200",
                                  isActive
                                    ? "bg-white text-black shadow-[0_8px_24px_rgba(255,255,255,0.2)]"
                                    : "bg-white/[0.04] text-current",
                                )}
                              >
                                <Icon />
                              </span>
                              <span className="text-sm font-medium tracking-[-0.01em]">
                                {item.label}
                              </span>
                            </Link>
                          </motion.div>
                        );
                      })}
                    </div>
                  </nav>

                  <div className="border-t border-white/[0.07] p-3">
                    <div className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.03] px-3 py-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[rgba(var(--ring),0.18)] text-sm font-semibold text-[rgb(var(--foreground))] shadow-[0_6px_20px_rgba(99,102,241,0.28)]">
                        U
                      </div>
                      <div className="min-w-0 overflow-hidden">
                        <p className="text-sm font-medium text-[rgb(var(--foreground))]">
                          Workspace
                        </p>
                        <p className="tf-meta">active account</p>
                      </div>
                    </div>
                  </div>
                </motion.aside>
              </>
            )}
          </AnimatePresence>,
          portalNode,
        )
      : null;

  return (
    <>
      {!isMobileViewport && (
        <div
          className={cn(
            "hidden xl:block xl:shrink-0 transition-all duration-300",
            desktopWidthClass,
          )}
        />
      )}

      {desktopSidebar}
      {mobileSidebar}
    </>
  );
}
