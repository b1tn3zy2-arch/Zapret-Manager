import { useEffect, useState } from "react";

import { UPTIME_TICK_MS } from "@/lib/constants";

function pad(value: number): string {
  return value.toString().padStart(2, "0");
}

function formatUptime(elapsedMs: number): string {
  const total = Math.max(0, Math.floor(elapsedMs / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export function useUptime(startedAt: number | null): string {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (startedAt === null) {
      return;
    }

    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, UPTIME_TICK_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, [startedAt]);

  if (startedAt === null) {
    return "--:--:--";
  }

  return formatUptime(now - startedAt);
}
