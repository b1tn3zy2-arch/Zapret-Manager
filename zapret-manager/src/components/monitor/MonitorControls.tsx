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
        {isPaused ? "Возобновить" : "Пауза"}
      </Button>

      <Tooltip content="Сохранить графики в PNG">
        <Button
          size="icon"
          variant="secondary"
          aria-label="Сохранить снимок графиков"
          disabled={isSaving}
          onClick={onSnapshot}
          icon={
            <Camera aria-hidden="true" className="size-4" strokeWidth={2} />
          }
        />
      </Tooltip>

      <Tooltip content="Очистить буфер и начать график заново">
        <Button
          size="icon"
          variant="ghost"
          aria-label="Очистить буфер графика"
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
