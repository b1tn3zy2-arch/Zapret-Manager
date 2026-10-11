import { useI18n } from "@/i18n";
import { Camera, Pause, Play, Trash2 } from "lucide-react";

import { Button, Tooltip } from "@/components/ui";

export interface MonitorControlsProps {
  isPaused: boolean;
  isSaving: boolean;
  onTogglePause: () => void;
  onSnapshot: () => void;
  onClear: () => void;
}

function MonitorControls({
  isPaused,
  isSaving,
  onTogglePause,
  onSnapshot,
  onClear,
}: MonitorControlsProps) {
  const { t } = useI18n();
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        size="sm"
        variant={isPaused ? "primary" : "secondary"}
        onClick={onTogglePause}
        icon={
          isPaused ? (
            <Play aria-hidden="true" className="size-3.5" strokeWidth={2} />
          ) : (
            <Pause aria-hidden="true" className="size-3.5" strokeWidth={2} />
          )
        }
      >
        {isPaused ? t("common.resume") : t("common.pause")}
      </Button>

      <Tooltip content={t("monitor.controls.snapshot")}>
        <Button
          size="icon"
          variant="secondary"
          aria-label={t("monitor.controls.snapshotAria")}
          disabled={isSaving}
          onClick={onSnapshot}
          icon={
            <Camera aria-hidden="true" className="size-4" strokeWidth={2} />
          }
        />
      </Tooltip>

      <Tooltip content={t("monitor.controls.clear")}>
        <Button
          size="icon"
          variant="ghost"
          aria-label={t("monitor.controls.clearAria")}
          onClick={onClear}
          icon={
            <Trash2 aria-hidden="true" className="size-4" strokeWidth={2} />
          }
        />
      </Tooltip>
    </div>
  );
}

export default MonitorControls;
