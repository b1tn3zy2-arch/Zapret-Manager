import { useCallback, useState, type DragEvent } from "react";
import { Upload } from "lucide-react";

import { Button, Text } from "@/components/ui";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  disabled: boolean;
  onChooseFile: () => void;
  onDrop: () => void;
}

export default function EmptyState({
  disabled,
  onChooseFile,
  onDrop,
}: EmptyStateProps) {
  const { t } = useI18n();
  const [isOver, setIsOver] = useState(false);

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>): void => {
      event.preventDefault();
      setIsOver(false);

      if (disabled) {
        return;
      }

      if (event.dataTransfer.files.length > 0) {
        onDrop();
      }
    },
    [disabled, onDrop]
  );

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        setIsOver(true);
      }}
      onDragLeave={() => {
        setIsOver(false);
      }}
      onDrop={handleDrop}
      className={cn(
        "flex flex-col items-center gap-3 rounded-xl border-2 border-dashed",
        "px-6 py-10 text-center transition-colors duration-200",
        isOver
          ? "border-accent-primary bg-white/5"
          : "border-white/10 bg-white/[0.02]"
      )}
    >
      <span
        aria-hidden="true"
        className="text-accent-primary bg-accent-primary/10 flex size-14 items-center justify-center rounded-full"
      >
        <Upload className="size-6" strokeWidth={2} />
      </span>

      <Text variant="label" className="text-text-primary">
        {t("dashboard.vpn.noConfigs")}
      </Text>

      <Text variant="body" size="sm" className="text-text-tertiary">
        {t("dashboard.vpn.noConfigsHint")}
      </Text>

      <Button
        size="sm"
        disabled={disabled}
        onClick={onChooseFile}
        icon={<Upload aria-hidden="true" className="size-4" strokeWidth={2} />}
      >
        {t("dashboard.vpn.chooseFile")}
      </Button>
    </div>
  );
}
