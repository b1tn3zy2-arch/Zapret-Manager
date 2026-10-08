import { FolderOpen, Play, Square, X } from "lucide-react";

import { Button } from "@/components/ui";
import { formatFileSize, formatRelativeTime } from "@/lib/format";
import { capitalizeService } from "@/lib/format";
import type { Strategy } from "@/types";

export interface StrategyCardBackProps {
  strategy: Strategy;
  isRunning: boolean;
  isBusy: boolean;
  onRun: () => void;
  onStop: () => void;
  onOpenFolder: () => void;
  onClose: () => void;
}

const FILE_TYPE_LABELS = {
  winws: "winws",
  "goodbye-dpi": "goodbye-dpi",
  zapret: "zapret",
  unknown: "неизвестно",
} as const satisfies Record<Strategy["fileType"], string>;

function StrategyCardBack({
  strategy,
  isRunning,
  isBusy,
  onRun,
  onStop,
  onOpenFolder,
  onClose,
}: StrategyCardBackProps) {
  return (
    <div className="flex h-full flex-col gap-3 p-4 text-left">
      <div className="flex flex-col gap-1">
        <h3 className="text-text-primary text-base leading-tight font-bold">
          {strategy.name}
        </h3>
        <p className="text-text-tertiary truncate font-mono text-[10px]">
          {strategy.filename}
        </p>
      </div>

      <p className="text-text-secondary line-clamp-4 min-h-0 flex-1 scrollbar-thin overflow-y-auto text-xs leading-relaxed">
        {strategy.description}
      </p>

      <dl className="text-text-tertiary grid grid-cols-2 gap-x-2 gap-y-1 text-[10px]">
        <dt>Тип</dt>
        <dd className="text-text-secondary truncate text-right">
          {FILE_TYPE_LABELS[strategy.fileType]}
        </dd>

        <dt>Размер</dt>
        <dd className="text-text-secondary text-right">
          {formatFileSize(strategy.size)}
        </dd>

        <dt>Изменён</dt>
        <dd className="text-text-secondary truncate text-right">
          {strategy.modifiedAt === undefined
            ? "—"
            : formatRelativeTime(strategy.modifiedAt)}
        </dd>

        <dt>Сервисы</dt>
        <dd className="text-text-secondary truncate text-right">
          {strategy.services.map(capitalizeService).join(", ") || "—"}
        </dd>
      </dl>

      <p
        className="text-text-tertiary truncate font-mono text-[9px]"
        title={strategy.path}
      >
        {strategy.path}
      </p>

      <div className="flex flex-col gap-1.5">
        {isRunning ? (
          <Button
            size="sm"
            variant="danger"
            disabled={isBusy}
            onClick={onStop}
            icon={<Square aria-hidden="true" className="size-3.5" />}
          >
            Остановить
          </Button>
        ) : (
          <Button
            size="sm"
            disabled={isBusy}
            onClick={onRun}
            icon={<Play aria-hidden="true" className="size-3.5" />}
          >
            Запустить
          </Button>
        )}

        <div className="flex gap-1.5">
          <Button
            size="sm"
            variant="secondary"
            className="flex-1"
            onClick={onOpenFolder}
            icon={<FolderOpen aria-hidden="true" className="size-3.5" />}
          >
            Папка
          </Button>
          <Button
            size="sm"
            variant="ghost"
            aria-label="Закрыть карту"
            title="Закрыть"
            onClick={onClose}
            icon={<X aria-hidden="true" className="size-3.5" />}
          />
        </div>
      </div>
    </div>
  );
}

export default StrategyCardBack;
