import { Gamepad2, Play, RefreshCw, Square } from "lucide-react";

import { Badge, Button, Card, Spinner, Tooltip } from "@/components/ui";
import {
  capitalizeService,
  formatFileSize,
  formatRelativeTime,
} from "@/lib/format";
import { serviceColor } from "@/lib/serviceColors";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { TECHNIQUE_LABELS, type Strategy, type StrategyStatus } from "@/types";

const STATUS_VARIANTS = {
  idle: "neutral",
  running: "success",
  error: "error",
  stopped: "neutral",
  starting: "warning",
  stopping: "warning",
} as const satisfies Record<
  StrategyStatus,
  "neutral" | "success" | "error" | "warning"
>;

const STATUS_LABELS = {
  idle: "Не запущена",
  running: "Запущена",
  error: "Ошибка",
  stopped: "Остановлена",
  starting: "Запускается",
  stopping: "Останавливается",
} as const satisfies Record<StrategyStatus, string>;

export interface StrategyCardProps {
  strategy: Strategy;
  onRun?: (strategy: Strategy) => void;
  onStop?: (strategy: Strategy) => void;
}

export default function StrategyCard({
  strategy,
  onRun,
  onStop,
}: StrategyCardProps) {
  const { status } = strategy;
  const isBusy = status === "starting" || status === "stopping";
  const isRunning = status === "running";
  const outlastEnabled = useSettingsStore(
    (state) => state.settings.outlastTrials.enabled
  );

  const modified =
    strategy.modifiedAt === undefined
      ? "нет данных"
      : formatRelativeTime(strategy.modifiedAt);

  const renderAction = () => {
    if (isBusy) {
      return (
        <Button
          size="icon"
          variant="secondary"
          aria-label={`${STATUS_LABELS[status]} ${strategy.name}`}
          disabled
        >
          <Spinner size="sm" />
        </Button>
      );
    }

    if (isRunning) {
      return (
        <Button
          size="icon"
          variant="danger"
          aria-label={`Остановить ${strategy.name}`}
          disabled={onStop === undefined}
          onClick={() => {
            onStop?.(strategy);
          }}
        >
          <Square aria-hidden="true" className="size-4" strokeWidth={2} />
        </Button>
      );
    }

    return (
      <Button
        size="icon"
        variant="primary"
        aria-label={`Запустить ${strategy.name}`}
        disabled={onRun === undefined}
        onClick={() => {
          onRun?.(strategy);
        }}
      >
        {status === "error" ? (
          <RefreshCw aria-hidden="true" className="size-4" strokeWidth={2} />
        ) : (
          <Play aria-hidden="true" className="size-4" strokeWidth={2} />
        )}
      </Button>
    );
  };

  return (
    <Card variant="interactive" className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-text-primary text-base font-semibold">
          {strategy.name}
        </h3>
        <Badge
          variant={STATUS_VARIANTS[status]}
          dot={status === "running"}
          pulse={status === "running" || status === "starting"}
        >
          {STATUS_LABELS[status]}
        </Badge>
      </div>

      <p className="text-text-tertiary truncate font-mono text-xs">
        {strategy.filename}
      </p>

      {strategy.description !== strategy.name ? (
        <p className="text-text-secondary line-clamp-2 min-h-10 text-sm">
          {strategy.description}
        </p>
      ) : null}

      {strategy.techniques.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {strategy.techniques.map((technique) => (
            <span
              key={technique}
              className="text-text-secondary rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs"
            >
              {TECHNIQUE_LABELS[technique] ?? technique}
            </span>
          ))}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-1.5">
        {strategy.services.map((service) => (
          <Badge key={service} variant={serviceColor(service)}>
            {capitalizeService(service)}
          </Badge>
        ))}

        {outlastEnabled ? (
          <Tooltip content="Домены Outlast Trials будут добавлены в конфиги при запуске">
            <span>
              <Badge variant="accent">
                <Gamepad2 aria-hidden="true" className="size-3" />+ Outlast
              </Badge>
            </span>
          </Tooltip>
        ) : null}
      </div>

      {strategy.error !== undefined ? (
        <p className="text-accent-danger text-xs">{strategy.error}</p>
      ) : null}

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-white/5 pt-3">
        <div className="text-text-tertiary flex flex-col gap-0.5 text-xs">
          <span>{formatFileSize(strategy.size)}</span>
          <span>{modified}</span>
          {strategy.pid !== undefined ? (
            <span className="font-mono">PID {strategy.pid}</span>
          ) : null}
        </div>

        {renderAction()}
      </div>
    </Card>
  );
}
