// Импортируем зависимости из модуля @/components/ui.
import { Badge, Tooltip } from "@/components/ui";
// Импортируем зависимости из модуля @/i18n.
import { useI18n } from "@/i18n";
// Импортируем зависимости из модуля @/stores/useSettingsStore.
import { useSettingsStore } from "@/stores/useSettingsStore";
// Импортируем зависимости из модуля @/types.
import type { Strategy } from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface EngineBadgeProps {
  // Обрабатываем конструкцию: strategy.
  strategy: Strategy;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Сохраняем пояснение разработчика:
/**
 // Сохраняем пояснение разработчика: * Бейдж движка стратегии.
 * Бейдж движка стратегии.
 // Сохраняем пояснение разработчика: *
 *
 // Сохраняем пояснение разработчика: * Показывает эффективный движок, а не выбранный в настройках…
 * Показывает эффективный движок, а не выбранный в настройках: в режиме «авто»
 // Сохраняем пояснение разработчика: * решение принимается по самой стратегии, и карточка раньше …
 * решение принимается по самой стратегии, и карточка раньше молчала о том,
 // Сохраняем пояснение разработчика: * какой движок сработает на самом деле.
 * какой движок сработает на самом деле.
 // Сохраняем пояснение разработчика: 
 */
// Обрабатываем конструкцию: export.
export default function EngineBadge({ strategy }: EngineBadgeProps) {
  // Обрабатываем конструкцию: const { t } = useI18n().
  const { t } = useI18n();
  // Обрабатываем конструкцию: const engine = useSettingsStore( (state) => state.setti….
  const engine = useSettingsStore(
    // Объявляем функцию-обработчик или стрелочную функцию.
    (state) => state.settings.advanced.strategyEngine
    // Закрываем выражение или список аргументов.
  );
  // Обрабатываем конструкцию: const hasConfig = (strategy.config?.groups.length ?? 0)….
  const hasConfig = (strategy.config?.groups.length ?? 0) > 0;
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: engine === legacy.
  if (engine === "legacy") {
    // Возвращаем результат: ( <Badge variant=neutral size=sm> {t(strategies.engine.….
    return (
      // Обрабатываем конструкцию: <Badge variant=neutral size=sm>.
      <Badge variant="neutral" size="sm">
        {/* Выводим текстовое содержимое в JSX. */}
        {t("strategies.engine.legacy")}
        {/* Выводим текстовое содержимое в JSX. */}
      </Badge>
      // Закрываем выражение или список аргументов.
    );
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: engine === native && !hasConfig.
  if (engine === "native" && !hasConfig) {
    // Возвращаем результат: ( <Tooltip content={t(strategies.engine.configMissingHi….
    return (
      // Обрабатываем конструкцию: <Tooltip content={t(strategies.engine.configMissingHint….
      <Tooltip content={t("strategies.engine.configMissingHint")}>
        {/* Выводим текстовое содержимое в JSX. */}
        <span>
          {/* Выводим текстовое содержимое в JSX. */}
          <Badge variant="warning" size="sm">
            {/* Выводим текстовое содержимое в JSX. */}
            {t("strategies.engine.configMissing")}
            {/* Выводим текстовое содержимое в JSX. */}
          </Badge>
          {/* Выводим текстовое содержимое в JSX. */}
        </span>
        {/* Выводим текстовое содержимое в JSX. */}
      </Tooltip>
      // Закрываем выражение или список аргументов.
    );
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: engine === auto.
  if (engine === "auto") {
    // Обрабатываем конструкцию: const effective = hasConfig ? native : legacy.
    const effective = hasConfig ? "native" : "legacy";
    // — разделитель логических блоков —

    // Возвращаем результат: ( <Tooltip content={t(strategies.engine.effectiveHint, ….
    return (
      // Обрабатываем конструкцию: <Tooltip content={t(strategies.engine.effectiveHint, { ….
      <Tooltip
        // Обрабатываем конструкцию: content.
        content={t("strategies.engine.effectiveHint", {
          // Обрабатываем конструкцию: engine.
          engine: t(
            // Обрабатываем конструкцию: effective.
            effective === "native"
              ? // Обрабатываем конструкцию: ?.
                // Продолжаем предыдущую конструкцию.
                "strategies.engine.native"
              : // Обрабатываем конструкцию: :.
                // Продолжаем предыдущую конструкцию.
                "strategies.engine.legacy"
            // Закрываем выражение или список аргументов.
          ),
          // Закрываем текущий блок.
        })}
        // Продолжаем выражение.
      >
        {/* Выводим текстовое содержимое в JSX. */}
        <span>
          {/* Выводим текстовое содержимое в JSX. */}
          <Badge variant={hasConfig ? "accent" : "neutral"} size="sm">
            {/* Выводим текстовое содержимое в JSX. */}
            {t("strategies.engine.auto")}
            {/* Выводим текстовое содержимое в JSX. */}
          </Badge>
          {/* Выводим текстовое содержимое в JSX. */}
        </span>
        {/* Выводим текстовое содержимое в JSX. */}
      </Tooltip>
      // Закрываем выражение или список аргументов.
    );
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: ( <Badge variant=accent size=sm> {t(strategies.engine.n….
  return (
    // Обрабатываем конструкцию: <Badge variant=accent size=sm>.
    <Badge variant="accent" size="sm">
      {/* Выводим текстовое содержимое в JSX. */}
      {t("strategies.engine.native")}
      {/* Выводим текстовое содержимое в JSX. */}
    </Badge>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
