import { motion } from "framer-motion";
import { Shield } from "lucide-react";

import { Text } from "@/components/ui";
import Modal from "@/components/ui/Modal";
import { useI18n } from "@/i18n";
import { formatBytesForResources, stageLabel } from "@/lib/resources";
import { ANIMATION } from "@/lib/constants";
import type { InitProgress } from "@/types";

export interface InitProgressModalProps {
  open: boolean;
  progress: InitProgress | null;
  extractedBytes: number;
}

function InitProgressModal({
  open,
  progress,
  extractedBytes,
}: InitProgressModalProps) {
  const { t } = useI18n();
  const percent = progress?.percent ?? 0;

  return (
    <Modal
      open={open}
      onClose={() => undefined}
      title={t("settings.resources.firstRunTitle")}
      description={t("settings.resources.firstRunHint")}
      size="sm"
      closeOnBackdrop={false}
      closeOnEscape={false}
      showCloseButton={false}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <Text variant="label" className="text-text-primary">
            {stageLabel(progress?.stage ?? "idle")}
          </Text>
          <Text variant="caption" size="sm" className="text-text-tertiary">
            {progress?.currentFile ?? t("settings.resources.stageIdle")}
          </Text>
        </div>

        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          aria-label={t("settings.resources.progressAriaLabel")}
          className="h-2 w-full overflow-hidden rounded-full bg-white/10"
        >
          <motion.div
            className="bg-accent-primary h-full rounded-full"
            initial={{ width: "0%" }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: ANIMATION.normal, ease: "easeOut" }}
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <Text variant="caption" size="sm" className="text-text-tertiary">
            {formatBytesForResources(extractedBytes)}
          </Text>
          <span className="text-text-primary text-2xl font-bold tabular-nums">
            {percent}%
          </span>
        </div>

        <div className="text-text-tertiary flex items-center gap-2 text-xs">
          <Shield aria-hidden="true" className="size-3.5" strokeWidth={2} />
          {t("settings.resources.firstRunDoNotClose")}
        </div>
      </div>
    </Modal>
  );
}

export default InitProgressModal;
