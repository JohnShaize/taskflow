"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface GlassSelectOption {
  label: string;
  value: string;
}

interface GlassSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: GlassSelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  dropdownClassName?: string;
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <motion.svg
      animate={{ rotate: open ? 180 : 0 }}
      transition={{ duration: 0.2 }}
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="m6 9 6 6 6-6" />
    </motion.svg>
  );
}

export function GlassSelect({
  value,
  onChange,
  options,
  placeholder = "Select option",
  disabled = false,
  className,
  dropdownClassName,
}: GlassSelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  );

  useEffect(() => {
    function handleOutside(event: MouseEvent | TouchEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);

    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
    };
  }, []);

  function handleSelect(nextValue: string) {
    onChange(nextValue);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className={cn("relative w-full", className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((prev) => !prev)}
        className={cn(
          "tf-panel-soft flex w-full items-center justify-between gap-3 rounded-[1rem] px-4 py-3 text-left text-sm text-[rgb(var(--foreground))] transition-all duration-200",
          "border border-black/6 dark:border-white/10",
          "disabled:cursor-not-allowed disabled:opacity-50",
          open && "ring-1 ring-white/10 dark:ring-white/14",
        )}
      >
        <span className="truncate">{selectedOption?.label ?? placeholder}</span>

        <span className="shrink-0 text-[rgb(var(--muted-foreground))]">
          <ChevronIcon open={open} />
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 6, scale: 0.98, filter: "blur(8px)" }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className={cn(
              "absolute left-0 top-[calc(100%+0.55rem)] z-[160] w-full overflow-hidden rounded-[1.1rem]",
              "border border-black/8 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.06),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.9),rgba(255,255,255,0.84))] shadow-[0_22px_60px_rgba(15,23,42,0.16)]",
              "dark:border-white/10 dark:bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.06),transparent_30%),linear-gradient(180deg,rgba(7,10,20,0.97),rgba(3,6,16,0.98))] dark:shadow-[0_26px_70px_rgba(0,0,0,0.5)]",
              dropdownClassName,
            )}
          >
            <div className="max-h-72 overflow-y-auto p-2">
              {options.map((option) => {
                const isSelected = option.value === value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-[0.9rem] px-3 py-2.5 text-left text-sm transition-colors",
                      isSelected
                        ? "bg-black/[0.06] text-[rgb(var(--foreground))] dark:bg-white/[0.08]"
                        : "text-[rgb(var(--muted-foreground))] hover:bg-black/[0.04] hover:text-[rgb(var(--foreground))] dark:hover:bg-white/[0.05]",
                    )}
                  >
                    <span className="truncate">{option.label}</span>

                    {isSelected && (
                      <span className="ml-3 shrink-0 text-xs text-[rgb(var(--muted-foreground))]">
                        Selected
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
