import { useEffect } from "react";

import { mark, measure, reportMetrics } from "@/lib/perf";

const BOOT_MARK = "app:boot";
const INTERACTIVE_MARK = "app:interactive";
const FIRST_PAINT_MARK = "app:first-paint";

export function useStartupMetrics(): void {
  useEffect(() => {
    if (!import.meta.env.DEV) {
      return;
    }

    mark(INTERACTIVE_MARK);
    mark(FIRST_PAINT_MARK);

    const interactive = measure("app:interactive-duration", BOOT_MARK);
    const firstPaint = measure("app:first-paint-duration", BOOT_MARK);

    reportMetrics([
      { name: "boot", value: interactive },
      { name: "firstPaint", value: firstPaint },
    ]);
  }, []);
}
