import { motion } from "framer-motion";

import { formatBytes } from "@/lib/trafficUtils";
import { formatEta } from "@/lib/updateUtils";
import type { DownloadProgress } from "@/types";

export interface UpdateProgressBarProps {
  progress: DownloadProgress;
}

function UpdateProgressBar({ progress }: UpdateProgressBarProps) {
  const percent = Math.max(0, Math.min(100, progress.percent));

  return (
    <div className="flex flex-col gap-2">
      <div
        className="bg-bg-secondary border-glass-border relative h-2 w-full overflow-hidden rounded-full border"
        role="progressbar"
        aria-label="Скачивание обновления"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(percent)}
      >
        <motion.span
          className="bg-accent-primary absolute inset-y-0 left-0 rounded-full"
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        />
      </div>

      <div className="text-text-tertiary flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="tabular-nums">
          {formatBytes(progress.downloaded)}
          {progress.total > 0 ? ` из ${formatBytes(progress.total)}` : ""}
        </span>
        <span className="tabular-nums">
          {formatBytes(progress.speed)}/с · {formatEta(progress.eta)}
        </span>
      </div>
    </div>
  );
}

export default UpdateProgressBar;
