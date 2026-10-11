import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { useVirtualizer } from "@tanstack/react-virtual";

import LogRow from "@/components/logs/LogRow";
import {
  AUTOSCROLL_THRESHOLD_PX,
  LOG_OVERSCAN,
  LOG_ROW_HEIGHT,
} from "@/lib/constants";
import type { LogEntry } from "@/types";

export interface LogListHandle {
  scrollToBottom: () => void;
}

export interface LogListProps {
  logs: LogEntry[];
  query?: string | undefined;
  autoScroll: boolean;
  onAutoScrollChange: (value: boolean) => void;
  onCopy: (entry: LogEntry) => void;
}

const LogList = forwardRef<LogListHandle, LogListProps>(function LogList(
  { logs, query, autoScroll, onAutoScrollChange, onCopy },
  ref
) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: logs.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => LOG_ROW_HEIGHT,
    overscan: LOG_OVERSCAN,
    getItemKey: (index) => logs[index]?.id ?? index,
  });
  const scrollToBottom = useCallback(() => {
    if (logs.length === 0) {
      return;
    }

    virtualizer.scrollToIndex(logs.length - 1, {
      align: "end",
      behavior: "auto",
    });
  }, [logs.length, virtualizer]);

  useImperativeHandle(ref, () => ({ scrollToBottom }), [scrollToBottom]);

  useEffect(() => {
    if (autoScroll) {
      scrollToBottom();
    }
  }, [autoScroll, scrollToBottom]);

  const handleScroll = useCallback(() => {
    const element = parentRef.current;

    if (element === null) {
      return;
    }

    const distance =
      element.scrollHeight - element.scrollTop - element.clientHeight;
    const atBottom = distance <= AUTOSCROLL_THRESHOLD_PX;

    if (atBottom !== autoScroll) {
      onAutoScrollChange(atBottom);
    }
  }, [autoScroll, onAutoScrollChange]);

  const items = virtualizer.getVirtualItems();

  return (
    <div
      ref={parentRef}
      onScroll={handleScroll}
      className="logs-container min-h-0 flex-1 scrollbar-none overflow-y-auto overscroll-contain"
    >
      <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
        {items.map((item) => {
          const entry = logs[item.index];

          if (entry === undefined) {
            return null;
          }

          return (
            <div
              key={entry.id}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: LOG_ROW_HEIGHT,
                transform: `translateY(${item.start}px)`,
              }}
            >
              <LogRow
                entry={entry}
                query={query}
                isEven={item.index % 2 === 0}
                onCopy={onCopy}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default LogList;
