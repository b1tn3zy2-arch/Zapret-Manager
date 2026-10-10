import { memo } from "react";

import HighlightText from "@/components/logs/HighlightText";
import { LOG_LEVEL_CLASSES, LOG_ROW_HEIGHT } from "@/lib/constants";
import { formatLogLine, formatLogTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { LogEntry } from "@/types";

const TIME_WIDTH = "86px";
const LEVEL_WIDTH = "58px";
const SOURCE_WIDTH = "74px";

export interface LogRowProps {
  entry: LogEntry;
  query?: string | undefined;
  isEven: boolean;
  onCopy: (entry: LogEntry) => void;
}

function LogRowImpl({ entry, query, isEven, onCopy }: LogRowProps) {
  return (
    <button
      type="button"
      title={formatLogLine(entry)}
      onClick={() => {
        onCopy(entry);
      }}
      style={{
        height: LOG_ROW_HEIGHT,
        backgroundColor: isEven ? "transparent" : "var(--color-glass-bg)",
      }}
      className={cn(
        "log-row text-text-secondary hover:bg-glass-hover focus-visible:bg-glass-hover",
        "flex w-full cursor-pointer items-center gap-2 px-3 text-left",
        "font-mono text-xs whitespace-nowrap focus-visible:outline-none"
      )}
    >
      <span
        className="log-row__time text-text-tertiary shrink-0 tabular-nums"
        style={{ width: TIME_WIDTH }}
      >
        {formatLogTime(entry.timestamp)}
      </span>

      <span
        className={cn(
          "log-row__level shrink-0 font-medium uppercase",
          LOG_LEVEL_CLASSES[entry.level]
        )}
        style={{ width: LEVEL_WIDTH }}
      >
        {entry.level}
      </span>

      <span
        className="log-row__source text-text-tertiary shrink-0 truncate"
        style={{ width: SOURCE_WIDTH }}
      >
        {entry.source}
      </span>

      <span className="min-w-0 flex-1 truncate">
        <HighlightText text={entry.message} query={query} />
      </span>
    </button>
  );
}

const LogRow = memo(LogRowImpl);

export default LogRow;
