import { Play, RefreshCw, Square } from "lucide-react";

import EngineBadge from "@/components/strategies/EngineBadge";
import GameBadges from "@/components/strategies/GameBadges";
import { useI18n } from "@/i18n";
import type { TranslationKey } from "@/i18n/types";
import { Badge, Button, Card, Spinner } from "@/components/ui";
import {
  capitalizeService,
  formatFileSize,
  formatRelativeTime,
} from "@/lib/format";
import { serviceColor } from "@/lib/serviceColors";

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
  idle: "strategies.status.idle",
  running: "strategies.status.running",
  error: "strategies.status.error",
  stopped: "strategies.status.stopped",
  starting: "strategies.status.starting",
  stopping: "strategies.status.stopping",
} as const satisfies Record<StrategyStatus, TranslationKey>;

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
  const { t } = useI18n();
  const { status } = strategy;
  const isBusy = status === "starting" || status === "stopping";
  const isRunning = status === "running";

  const modified =
    strategy.modifiedAt === undefined
      ? t("common.noData")
      : formatRelativeTime(strategy.modifiedAt);

  const renderAction = () => {
    if (isBusy) {
      return (
        <Button
          size="icon"
          variant="secondary"
          aria-label={`${t(STATUS_LABELS[status])} ${strategy.name}`}
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
          aria-label={t("strategies.card.stopAria", { name: strategy.name })}
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
        aria-label={t("strategies.card.runAria", { name: strategy.name })}
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
    <Card variant="interactive" hover className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-text-primary text-base font-semibold">
          {strategy.name}
        </h3>
        <Badge
          variant={STATUS_VARIANTS[status]}
          dot={status === "running"}
          pulse={status === "running" || status === "starting"}
        >
          {t(STATUS_LABELS[status])}
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
              className="text-text-secondary border-glass-border bg-glass-bg rounded-full border px-2 py-0.5 text-xs"
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

        <EngineBadge strategy={strategy} />

        <GameBadges />
      </div>

      {strategy.error !== undefined ? (
        <p className="text-accent-danger text-xs">{strategy.error}</p>
      ) : null}

      <div className="border-glass-border mt-auto flex items-center justify-between gap-3 border-t pt-3">
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
