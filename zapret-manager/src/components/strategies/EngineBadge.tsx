import { Badge, Tooltip } from "@/components/ui";
import { useI18n } from "@/i18n";
import { useSettingsStore } from "@/stores/useSettingsStore";
import type { Strategy } from "@/types";

export interface EngineBadgeProps {
  strategy: Strategy;
}

/**
 * Бейдж движка стратегии.
 *
 * Показывает эффективный движок, а не выбранный в настройках: в режиме «авто»
 * решение принимается по самой стратегии, и карточка раньше молчала о том,
 * какой движок сработает на самом деле.
 */
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

  if (engine === "native" && !hasConfig) {
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

  if (engine === "auto") {
    const effective = hasConfig ? "native" : "legacy";

    return (
      <Tooltip
        content={t("strategies.engine.effectiveHint", {
          engine: t(
            effective === "native"
              ? "strategies.engine.native"
              : "strategies.engine.legacy"
          ),
        })}
      >
        <span>
          <Badge variant={hasConfig ? "accent" : "neutral"} size="sm">
            {t("strategies.engine.auto")}
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
