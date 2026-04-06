"use client";

import { useEffect, useRef, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

import { DashboardStatusDistribution } from "@/types";

interface DashboardStatusDistributionChartProps {
  distribution: DashboardStatusDistribution;
}

export function DashboardStatusDistributionChart({
  distribution,
}: DashboardStatusDistributionChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [chartSize, setChartSize] = useState({ width: 0, height: 280 });

  const data = [
    { name: "Todo", value: distribution.todo },
    { name: "In Progress", value: distribution.in_progress },
    { name: "Done", value: distribution.done },
  ];

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
      <p className="tf-meta">Task mix</p>
      <h2 className="mt-2 tf-heading text-2xl text-[rgb(var(--foreground))]">
        Status distribution
      </h2>
      <p className="mt-3 text-sm leading-7 text-[rgb(var(--muted-foreground))]">
        Current task spread across your selected workspace scope.
      </p>

      <div
        ref={containerRef}
        className="mt-6 h-[280px] min-w-0 w-full overflow-hidden"
      >
        {chartSize.width > 0 ? (
          <BarChart
            width={chartSize.width}
            height={chartSize.height}
            data={data}
            barCategoryGap={24}
          >
            <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: "rgba(148,163,184,0.9)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: "rgba(148,163,184,0.9)", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.03)" }}
              contentStyle={{
                background: "rgba(10,10,10,0.92)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "16px",
                color: "#fff",
              }}
            />
            <Bar
              dataKey="value"
              radius={[12, 12, 0, 0]}
              fill="rgba(255,255,255,0.72)"
            />
          </BarChart>
        ) : null}
      </div>
    </section>
  );
}
