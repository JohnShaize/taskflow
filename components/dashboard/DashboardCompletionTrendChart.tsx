"use client";

import { useEffect, useRef, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

import { DashboardCompletionTrendPoint, DashboardDateRange } from "@/types";

interface DashboardCompletionTrendChartProps {
  data: DashboardCompletionTrendPoint[];
  range: DashboardDateRange;
}

function formatLabel(value: string) {
  const date = new Date(value);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function DashboardCompletionTrendChart({
  data,
  range,
}: DashboardCompletionTrendChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [chartSize, setChartSize] = useState({ width: 0, height: 280 });

  useEffect(() => {
    function updateSize() {
      const element = containerRef.current;
      if (!element) return;

      const width = element.clientWidth;
      const height = element.clientHeight || 280;

      if (width > 0 && height > 0) {
        setChartSize({ width, height });
      }
    }

    const element = containerRef.current;
    if (!element) return;

    updateSize();

    const observer = new ResizeObserver(() => {
      updateSize();
    });

    observer.observe(element);
    window.addEventListener("resize", updateSize);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateSize);
    };
  }, []);

  return (
    <section className="tf-panel tf-noise min-w-0 rounded-[1.75rem] p-5 sm:p-6">
      <p className="tf-meta">Delivery velocity</p>
      <h2 className="mt-2 tf-heading text-2xl text-[rgb(var(--foreground))]">
        Completion trend
      </h2>
      <p className="mt-3 text-sm leading-7 text-[rgb(var(--muted-foreground))]">
        Completed task count over the selected{" "}
        {range === "7d" ? "7-day" : range === "30d" ? "30-day" : "90-day"}{" "}
        window.
      </p>

      <div
        ref={containerRef}
        className="mt-6 h-[280px] min-w-0 w-full overflow-hidden"
      >
        {chartSize.width > 0 ? (
          <LineChart
            width={chartSize.width}
            height={chartSize.height}
            data={data}
          >
            <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={formatLabel}
              tick={{ fill: "rgba(148,163,184,0.9)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              minTickGap={24}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: "rgba(148,163,184,0.9)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              labelFormatter={(label) => formatLabel(String(label))}
              contentStyle={{
                background: "rgba(10,10,10,0.92)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "16px",
                color: "#fff",
              }}
            />
            <Line
              type="monotone"
              dataKey="completed"
              stroke="rgba(255,255,255,0.88)"
              strokeWidth={2.5}
              dot={{ r: 3, fill: "rgba(255,255,255,0.88)" }}
              activeDot={{ r: 5, fill: "#ffffff" }}
            />
          </LineChart>
        ) : null}
      </div>
    </section>
  );
}
