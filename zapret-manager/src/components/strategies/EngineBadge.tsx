import { Badge, Tooltip } from "@/components/ui";
import { useI18n } from "@/i18n";
import { useSettingsStore } from "@/stores/useSettingsStore";
import type { Strategy } from "@/types";

export interface EngineBadgeProps {
  strategy: Strategy;
}

export default function EngineBadge({ strategy }: EngineBadgeProps) {
  const { t } = useI18n();
  const engine = useSettingsStore(
    (state) => state.settings.advanced.strategyEngine
  );
  const hasConfig = (strategy.config?.groups.length ?? 0) > 0;

  if (engine === "legacy") {
    return (
      <Badge variant="neutral" size="sm">
        {t("strategies.engine.legacy")}
      </Badge>
    );
  }

  if (!hasConfig) {
    return (
      <Tooltip content={t("strategies.engine.configMissingHint")}>
        <span>
          <Badge variant="warning" size="sm">
            {t("strategies.engine.configMissing")}
          </Badge>
        </span>
      </Tooltip>
    );
  }

  return (
    <Badge variant="accent" size="sm">
      {t("strategies.engine.native")}
    </Badge>
  );
}
