import { memo } from "react";
import { ArrowRight, ScrollText } from "lucide-react";

import { Button, Text } from "@/components/ui";
import { GlassPanel } from "@/components/shared/GlassPanel";
import { RECENT_LOGS_COUNT } from "@/lib/constants";
import { LOG_LEVEL_CLASSES } from "@/lib/constants";
import { formatLogTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useLogsStore } from "@/stores/useLogsStore";
import type { LogEntry } from "@/types";

export interface DashboardRecentLogsProps {
  onOpenAllLogs: () => void;
}

function RecentRow({ entry }: { entry: LogEntry }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-text-tertiary shrink-0 font-mono">
        {formatLogTime(entry.timestamp)}
      </span>
      <span
        className={cn(
          "w-16 shrink-0 font-medium uppercase",
          LOG_LEVEL_CLASSES[entry.level]
        )}
      >
        {entry.level}
      </span>
      <span className="text-text-secondary truncate" title={entry.message}>
        {entry.message}
      </span>
    </div>
  );
}

function DashboardRecentLogs({ onOpenAllLogs }: DashboardRecentLogsProps) {
  const logs = useLogsStore((state) => state.logs);
  const recent = logs.slice(-RECENT_LOGS_COUNT).reverse();

  return (
    <GlassPanel padding="lg" className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-text-primary text-base font-semibold">
          Последние события
        </h3>

        <Button
          size="sm"
          variant="ghost"
          onClick={onOpenAllLogs}
          iconRight={<ArrowRight aria-hidden="true" className="size-3.5" />}
        >
          Все логи
        </Button>
      </div>

      {recent.length === 0 ? (
        <div className="text-text-tertiary flex flex-col items-center gap-2 py-6 text-center">
          <ScrollText
            aria-hidden="true"
            className="size-6"
            strokeWidth={1.75}
          />
          <Text variant="body" size="sm">
            Логов пока нет. Запустите стратегию — здесь появятся события.
          </Text>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {recent.map((entry) => (
            <RecentRow key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </GlassPanel>
  );
}

const MemoDashboardRecentLogs = memo(DashboardRecentLogs);

export default MemoDashboardRecentLogs;
