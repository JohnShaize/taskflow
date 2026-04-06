import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DashboardStatCardProps {
  label: string;
  value: number | string;
  icon: ReactNode;
  accent?: "high" | "medium" | "low";
}

export function DashboardStatCard({
  label,
  value,
  icon,
  accent,
}: DashboardStatCardProps) {
  return (
    <div className="tf-panel-soft rounded-[1.4rem] p-4 lg:p-5">
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "inline-flex h-11 w-11 items-center justify-center rounded-2xl text-[rgb(var(--foreground))]",
            accent === "high" && "tf-status-high",
            accent === "medium" && "tf-status-medium",
            accent === "low" && "tf-status-low",
            !accent && "bg-[rgba(var(--ring),0.16)]",
          )}
        >
          {icon}
        </span>

        <div>
          <p className="tf-meta">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-[rgb(var(--foreground))]">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}
