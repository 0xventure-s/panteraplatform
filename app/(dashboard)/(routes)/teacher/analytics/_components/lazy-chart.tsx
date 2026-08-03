"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const Chart = dynamic(
  () => import("./chart").then((module) => module.Chart),
  {
    ssr: false,
    loading: () => <div className="h-[350px] animate-pulse rounded-xl bg-muted" />,
  },
);

interface LazyChartProps {
  data: Array<{
    name: string;
    total: number;
  }>;
}

export const LazyChart = ({ data }: LazyChartProps) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if ("requestIdleCallback" in window) {
      const idleId = window.requestIdleCallback(() => setIsReady(true), {
        timeout: 800,
      });

      return () => window.cancelIdleCallback(idleId);
    }

    const timeoutId = globalThis.setTimeout(() => setIsReady(true), 0);
    return () => globalThis.clearTimeout(timeoutId);
  }, []);

  return isReady ? (
    <Chart data={data} />
  ) : (
    <div className="h-[350px] animate-pulse rounded-xl bg-muted" />
  );
};
