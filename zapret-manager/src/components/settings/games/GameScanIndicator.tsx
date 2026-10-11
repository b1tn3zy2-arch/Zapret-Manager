import { Loader2 } from "lucide-react";

import { useI18n } from "@/i18n";
import { SOURCE_LABEL_KEYS } from "@/lib/installedGames";
import type { GameScanProgress } from "@/types";

export interface GameScanIndicatorProps {
  scanning: boolean;
  found: number;
  progress: GameScanProgress | null;
}

export default function GameScanIndicator({
  scanning,
  found,
  progress,
}: GameScanIndicatorProps) {
  const { t } = useI18n();

  if (!scanning) {
    return (
      <span className="text-text-tertiary text-sm" data-testid="games-found">
        {t("settings.games.installed.count", { count: found })}
      </span>
    );
  }

  const source = progress?.source;

  return (
    <span
      role="status"
      aria-live="polite"
      className="text-text-secondary flex items-center gap-2 text-sm"
      data-testid="games-scanning"
    >
      <Loader2 aria-hidden="true" className="size-4 animate-spin" />
      {source === undefined
        ? t("settings.games.installed.scan.searching")
        : t("settings.games.installed.scan.source", {
            source: t(SOURCE_LABEL_KEYS[source]),
          })}
    </span>
  );
}
