import { memo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ScrollText } from "lucide-react";

import { Button, Text } from "@/components/ui";
import { GlassPanel } from "@/components/shared/GlassPanel";
import { useMotionPreference } from "@/hooks/useMotionPreference";
import { useI18n } from "@/i18n";
import {
  ANIMATION,
  LOG_LEVEL_CLASSES,
  RECENT_LOGS_COUNT,
} from "@/lib/constants";
import { formatLogTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useLogsStore } from "@/stores/useLogsStore";
import type { LogEntry } from "@/types";

export interface DashboardRecentLogsProps {
  onOpenAllLogs: () => void;
}

const ROW_STAGGER_S = 0.04;
const ROW_STAGGER_LIMIT = 0.2;

interface RecentRowProps {
  entry: LogEntry;
  index: number;
  reducedMotion: boolean;
}

function RecentRow({ entry, index, reducedMotion }: RecentRowProps) {
  const delay = reducedMotion
    ? 0
    : Math.min(index * ROW_STAGGER_S, ROW_STAGGER_LIMIT);

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      {...(reducedMotion ? {} : { exit: { opacity: 0 } })}
      transition={{ duration: ANIMATION.fast, delay }}
      className="flex items-center gap-2 text-xs"
    >
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
    </motion.div>
  );
}

function DashboardRecentLogs({ onOpenAllLogs }: DashboardRecentLogsProps) {
  const { t } = useI18n();
  const logs = useLogsStore((state) => state.logs);
  const { reduced: reducedMotion } = useMotionPreference();
  const recent = logs.slice(-RECENT_LOGS_COUNT).reverse();

  return (
    <GlassPanel padding="lg" className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-text-primary text-base font-semibold">
          {t("dashboard.recentLogs.title")}
        </h3>

        <Button
          size="sm"
          variant="ghost"
          onClick={onOpenAllLogs}
          iconRight={<ArrowRight aria-hidden="true" className="size-3.5" />}
        >
          {t("dashboard.recentLogs.openAll")}
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
            {t("dashboard.recentLogs.empty")}
          </Text>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          <AnimatePresence initial={false}>
            {recent.map((entry, index) => (
              <RecentRow
                key={entry.id}
                entry={entry}
                index={index}
                reducedMotion={reducedMotion}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </GlassPanel>
  );
}

const MemoDashboardRecentLogs = memo(DashboardRecentLogs);

export default MemoDashboardRecentLogs;
