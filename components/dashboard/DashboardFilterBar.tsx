"use client";

import { GlassSelect } from "@/components/ui/GlassSelect";
import { DashboardDateRange } from "@/types";

interface DashboardFilterBarProps {
  projectValue: string;
  rangeValue: DashboardDateRange;
  projectOptions: Array<{
    label: string;
    value: string;
  }>;
  onProjectChange: (value: string) => void;
  onRangeChange: (value: DashboardDateRange) => void;
}

const rangeOptions = [
  { label: "Last 7 days", value: "7d" },
  { label: "Last 30 days", value: "30d" },
  { label: "Last 90 days", value: "90d" },
];

export function DashboardFilterBar({
  projectValue,
  rangeValue,
  projectOptions,
  onProjectChange,
  onRangeChange,
}: DashboardFilterBarProps) {
  return (
    <section className="tf-panel tf-noise rounded-[1.75rem] p-5 sm:p-6">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div>
          <label className="tf-meta mb-2 block">Project filter</label>
          <GlassSelect
            value={projectValue}
            onChange={(value: string) => onProjectChange(value)}
            options={projectOptions}
          />
        </div>

        <div>
          <label className="tf-meta mb-2 block">Date range</label>
          <GlassSelect
            value={rangeValue}
            onChange={(value: string) =>
              onRangeChange(value as DashboardDateRange)
            }
            options={rangeOptions}
          />
        </div>
      </div>
    </section>
  );
}
