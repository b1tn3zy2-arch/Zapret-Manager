// Импортируем зависимости из модуля react.
import { useEffect, useRef, useState } from "react";
// Импортируем зависимости из модуля lucide-react.
import { Eraser, FolderOpen, FolderSearch, RefreshCw } from "lucide-react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/components/settings/SectionContainer.
import SectionContainer from "@/components/settings/SectionContainer";
// Импортируем зависимости из модуля @/components/settings/SettingRow.
import SettingRow from "@/components/settings/SettingRow";
// Импортируем зависимости из модуля @/components/ui.
import { Button, Input } from "@/components/ui";
// Импортируем зависимости из модуля @/i18n.
import { useI18n } from "@/i18n";
// Импортируем зависимости из модуля @/hooks/useSystemInfo.
import { openFolder } from "@/hooks/useSystemInfo";
// Импортируем зависимости из модуля @/hooks/useFolderPicker.
import { useFolderPicker } from "@/hooks/useFolderPicker";
// Импортируем зависимости из модуля @/lib/strategyCommands.
import { resetStrategyRatings } from "@/lib/strategyCommands";
// Импортируем зависимости из модуля @/lib/utils.
import { toErrorMessage } from "@/lib/utils";
// Импортируем зависимости из модуля @/stores/useLogsStore.
import { useLogsStore } from "@/stores/useLogsStore";
// Импортируем зависимости из модуля @/stores/useSettingsStore.
import { useSettingsStore } from "@/stores/useSettingsStore";
// Импортируем зависимости из модуля @/stores/useStrategiesStore.
import { useStrategiesStore } from "@/stores/useStrategiesStore";
// Импортируем зависимости из модуля @/stores/useStrategyRatingStore.
import { useStrategyRatingStore } from "@/stores/useStrategyRatingStore";
// Импортируем зависимости из модуля @/types/ipcSchemas.
import { StrategyInfoSchema } from "@/types/ipcSchemas";
// Импортируем зависимости из модуля @/lib/secureInvoke.
import { secureInvokeValidated } from "@/lib/secureInvoke";
// — разделитель логических блоков —

// Объявляем функцию StrategiesSection.
function StrategiesSection() {
  // Обрабатываем конструкцию: const { t } = useI18n().
  const { t } = useI18n();
  // Обрабатываем конструкцию: const folder = useSettingsStore((state) => state.settin….
  const folder = useSettingsStore((state) => state.settings.strategiesFolder);
  // Обрабатываем конструкцию: const updateAdvanced = useSettingsStore((state) => stat….
  const updateAdvanced = useSettingsStore((state) => state.updateAdvanced);
  // Обрабатываем конструкцию: const setStrategies = useStrategiesStore((state) => sta….
  const setStrategies = useStrategiesStore((state) => state.setStrategies);
  // Обрабатываем конструкцию: const clearRatings = useStrategyRatingStore((state) => ….
  const clearRatings = useStrategyRatingStore((state) => state.clear);
  // Обрабатываем конструкцию: const addLog = useLogsStore((state) => state.addLog).
  const addLog = useLogsStore((state) => state.addLog);
  // Обрабатываем конструкцию: const { pickFolder } = useFolderPicker().
  const { pickFolder } = useFolderPicker();
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const [busy, setBusy] = useState(false).
  const [busy, setBusy] = useState(false);
  // Обрабатываем конструкцию: const [resetArmed, setResetArmed] = useState(false).
  const [resetArmed, setResetArmed] = useState(false);
  // Обрабатываем конструкцию: const armTimer = useRef<number | null>(null).
  const armTimer = useRef<number | null>(null);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: useEffect.
  useEffect(() => {
    // Сохраняем пояснение разработчика: // Таймер подтверждения не должен доживать до размонтировани…
    // Таймер подтверждения не должен доживать до размонтирования:
    // Сохраняем пояснение разработчика: // setState на ушедшем со страницы компоненте падает в консо…
    // setState на ушедшем со страницы компоненте падает в консоль.
    // Возвращаем результат: () => { if (armTimer.current !== null) { window.clearTi….
    return () => {
      // Проверяем бизнес-условие: armTimer.current !== null.
      if (armTimer.current !== null) {
        // Обрабатываем конструкцию: window.
        window.clearTimeout(armTimer.current);
        // Закрываем текущий блок.
      }
      // Закрываем текущий блок.
    };
    // Закрываем текущий блок.
  }, []);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const rescan = async (): Promise<void> => { if (folder ….
  const rescan = async (): Promise<void> => {
    // Проверяем бизнес-условие: folder ===.
    if (folder === "") {
      // Завершаем функцию без возвращаемого значения.
      return;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: setBusy.
    setBusy(true);
    // Обрабатываем конструкцию: addLog.
    addLog({
      // Обрабатываем конструкцию: level.
      level: "info",
      // Обрабатываем конструкцию: source.
      source: "system",
      // Обрабатываем конструкцию: message.
      message: t("settings.strategies.rescanning"),
      // Закрываем текущий блок.
    });
    // — разделитель логических блоков —

    // Пробуем выполнить блок с обработкой ошибок.
    try {
      // Обрабатываем конструкцию: const strategies = await secureInvokeValidated( scan_st….
      const strategies = await secureInvokeValidated(
        // Обрабатываем конструкцию: scan_strategies.
        "scan_strategies",
        // Обрабатываем конструкцию: StrategyInfoSchema.
        StrategyInfoSchema.array(),
        // Открываем объектный литерал.
        {
          // Передаём поле folder в объект.
          folder,
          // Закрываем текущий блок.
        }
        // Закрываем выражение или список аргументов.
      );
      // Обрабатываем конструкцию: setStrategies.
      setStrategies(strategies);
      // Обрабатываем конструкцию: addLog.
      addLog({
        // Обрабатываем конструкцию: level.
        level: "success",
        // Обрабатываем конструкцию: source.
        source: "system",
        // Обрабатываем конструкцию: message.
        message: t("settings.strategies.foundLog", {
          // Обрабатываем конструкцию: count.
          count: strategies.length,
          // Закрываем текущий блок.
        }),
        // Закрываем текущий блок.
      });
      // Закрываем текущий блок.
    } finally {
      // Обрабатываем конструкцию: setBusy.
      setBusy(false);
      // Закрываем текущий блок.
    }
    // Закрываем текущий блок.
  };
  // — разделитель логических блоков —

  // Сохраняем пояснение разработчика:
  /**
   // Сохраняем пояснение разработчика: * Сброс замеров рейтинга: необратимое действие, поэтому кноп…
   * Сброс замеров рейтинга: необратимое действие, поэтому кнопка
   // Сохраняем пояснение разработчика: * работает в два шага — первый клик только просит подтвержде…
   * работает в два шага — первый клик только просит подтверждение
   // Сохраняем пояснение разработчика: * второй разовой клик уже удаляет записи.
   * второй разовой клик уже удаляет записи.
   // Сохраняем пояснение разработчика: 
   */
  // Обрабатываем конструкцию: const resetRatings = async (): Promise<void> => { if (!….
  const resetRatings = async (): Promise<void> => {
    // Проверяем бизнес-условие: !resetArmed.
    if (!resetArmed) {
      // Обрабатываем конструкцию: setResetArmed.
      setResetArmed(true);
      // Обрабатываем конструкцию: armTimer.
      armTimer.current = window.setTimeout(() => {
        // Обрабатываем конструкцию: setResetArmed.
        setResetArmed(false);
        // Закрываем текущий блок.
      }, 4000);
      // — разделитель логических блоков —

      // Завершаем функцию без возвращаемого значения.
      return;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Проверяем бизнес-условие: armTimer.current !== null.
    if (armTimer.current !== null) {
      // Обрабатываем конструкцию: window.
      window.clearTimeout(armTimer.current);
      // Обрабатываем конструкцию: armTimer.
      armTimer.current = null;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: setResetArmed.
    setResetArmed(false);
    // — разделитель логических блоков —

    // Пробуем выполнить блок с обработкой ошибок.
    try {
      // Ожидаем завершение асинхронной операции await resetStrategyRatings().
      await resetStrategyRatings();
      // Обрабатываем конструкцию: clearRatings.
      clearRatings();
      // Обрабатываем конструкцию: addLog.
      addLog({
        // Обрабатываем конструкцию: level.
        level: "info",
        // Обрабатываем конструкцию: source.
        source: "system",
        // Обрабатываем конструкцию: message.
        message: t("settings.strategies.resetRatingsDone"),
        // Закрываем текущий блок.
      });
      // Закрываем текущий блок.
    } catch (caught) {
      // Обрабатываем конструкцию: addLog.
      addLog({
        // Обрабатываем конструкцию: level.
        level: "error",
        // Обрабатываем конструкцию: source.
        source: "system",
        // Обрабатываем конструкцию: message.
        message: t("settings.strategies.resetRatingsFailed", {
          // Обрабатываем конструкцию: error.
          error: toErrorMessage(caught),
          // Закрываем текущий блок.
        }),
        // Закрываем текущий блок.
      });
      // Закрываем текущий блок.
    }
    // Закрываем текущий блок.
  };
  // — разделитель логических блоков —

  // Возвращаем результат: ( <SectionContainer title={t(settings.strategies.title)….
  return (
    // Обрабатываем конструкцию: <SectionContainer title={t(settings.strategies.title)} ….
    <SectionContainer
      // Обрабатываем конструкцию: title.
      title={t("settings.strategies.title")}
      // Обрабатываем конструкцию: description.
      description={t("settings.strategies.description")}
      // Обрабатываем конструкцию: onReset.
      onReset={() => {
        // Обрабатываем конструкцию: updateAdvanced.
        updateAdvanced({
          // Обрабатываем конструкцию: strategyStartTimeoutSec.
          strategyStartTimeoutSec: 15,
          // Обрабатываем конструкцию: strategyStopTimeoutSec.
          strategyStopTimeoutSec: 10,
          // Закрываем текущий блок.
        });
        // Закрываем текущий блок.
      }}
      // Обрабатываем конструкцию: resetLabel.
      resetLabel={t("settings.common.resetSection")}
      // Продолжаем выражение.
    >
      {/* Выводим текстовое содержимое в JSX. */}
      <SettingRow
        // Задаём атрибут stacked элемента.
        stacked
        // Обрабатываем конструкцию: label.
        label={t("settings.strategies.folder")}
        // Обрабатываем конструкцию: control.
        control={
          // Обрабатываем конструкцию: <div className=flex flex-col gap-2>.
          <div className="flex flex-col gap-2">
            {/* Выводим текстовое содержимое в JSX. */}
            <Input
              // Задаём атрибут data-focus-quiet элемента.
              data-focus-quiet
              // Обрабатываем конструкцию: variant.
              variant="filled"
              // Обрабатываем конструкцию: value.
              value={folder}
              // Задаём атрибут readOnly элемента.
              readOnly
              // Обрабатываем конструкцию: placeholder.
              placeholder="C:\\zapret-discord-youtube"
              // Обрабатываем конструкцию: aria-label.
              aria-label={t("settings.strategies.folder")}
              // Продолжаем выражение.
            />
            {/* Выводим текстовое содержимое в JSX. */}
            <div className="flex flex-wrap gap-2">
              {/* Выводим текстовое содержимое в JSX. */}
              <Button
                // Обрабатываем конструкцию: size.
                size="sm"
                // Обрабатываем конструкцию: variant.
                variant="secondary"
                // Обрабатываем конструкцию: onClick.
                onClick={() => {
                  // Обрабатываем конструкцию: void pickFolder().
                  void pickFolder();
                  // Закрываем текущий блок.
                }}
                // Обрабатываем конструкцию: icon.
                icon={<FolderSearch aria-hidden="true" className="size-4" />}
                // Продолжаем выражение.
              >
                {/* Выводим текстовое содержимое в JSX. */}
                {t("settings.strategies.choose")}
                {/* Выводим текстовое содержимое в JSX. */}
              </Button>
              {/* Выводим текстовое содержимое в JSX. */}
              <Button
                // Обрабатываем конструкцию: size.
                size="sm"
                // Обрабатываем конструкцию: variant.
                variant="secondary"
                // Обрабатываем конструкцию: disabled.
                disabled={folder === ""}
                // Обрабатываем конструкцию: loading.
                loading={busy}
                // Обрабатываем конструкцию: onClick.
                onClick={() => {
                  // Обрабатываем конструкцию: void rescan().
                  void rescan();
                  // Закрываем текущий блок.
                }}
                // Обрабатываем конструкцию: icon.
                icon={<RefreshCw aria-hidden="true" className="size-4" />}
                // Продолжаем выражение.
              >
                {/* Выводим текстовое содержимое в JSX. */}
                {t("settings.strategies.rescan")}
                {/* Выводим текстовое содержимое в JSX. */}
              </Button>
              {/* Выводим текстовое содержимое в JSX. */}
              <Button
                // Обрабатываем конструкцию: size.
                size="sm"
                // Обрабатываем конструкцию: variant.
                variant="ghost"
                // Обрабатываем конструкцию: disabled.
                disabled={folder === ""}
                // Обрабатываем конструкцию: onClick.
                onClick={() => {
                  // Обрабатываем конструкцию: void openFolder(strategies, folder).catch(() => undefin….
                  void openFolder("strategies", folder).catch(() => undefined);
                  // Закрываем текущий блок.
                }}
                // Обрабатываем конструкцию: icon.
                icon={<FolderOpen aria-hidden="true" className="size-4" />}
                // Продолжаем выражение.
              >
                {/* Выводим текстовое содержимое в JSX. */}
                {t("settings.common.openFolder")}
                {/* Выводим текстовое содержимое в JSX. */}
              </Button>
              {/* Выводим текстовое содержимое в JSX. */}
            </div>
            {/* Выводим текстовое содержимое в JSX. */}
          </div>
          // Закрываем текущий блок.
        }
        // Продолжаем выражение.
      />
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <SettingRow
        // Задаём атрибут stacked элемента.
        stacked
        // Обрабатываем конструкцию: label.
        label={t("settings.strategies.resetRatings")}
        // Обрабатываем конструкцию: description.
        description={t("settings.strategies.resetRatingsHint")}
        // Обрабатываем конструкцию: control.
        control={
          // Обрабатываем конструкцию: <Button size=sm variant={resetArmed ? danger : ghost} o….
          <Button
            // Обрабатываем конструкцию: size.
            size="sm"
            // Обрабатываем конструкцию: variant.
            variant={resetArmed ? "danger" : "ghost"}
            // Обрабатываем конструкцию: onClick.
            onClick={() => {
              // Обрабатываем конструкцию: void resetRatings().
              void resetRatings();
              // Закрываем текущий блок.
            }}
            // Обрабатываем конструкцию: icon.
            icon={<Eraser aria-hidden="true" className="size-4" />}
            // Продолжаем выражение.
          >
            {/* Выводим текстовое содержимое в JSX. */}
            {t(
              // Обрабатываем конструкцию: resetArmed.
              resetArmed
                ? // Обрабатываем конструкцию: ?.
                  // Продолжаем предыдущую конструкцию.
                  "settings.strategies.resetRatingsArmed"
                : // Обрабатываем конструкцию: :.
                  // Продолжаем предыдущую конструкцию.
                  "settings.strategies.resetRatings"
              // Закрываем выражение или список аргументов.
            )}
            {/* Выводим текстовое содержимое в JSX. */}
          </Button>
          // Закрываем текущий блок.
        }
        // Продолжаем выражение.
      />
      {/* Выводим текстовое содержимое в JSX. */}
    </SectionContainer>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export default StrategiesSection;.
export default StrategiesSection;
// — разделитель логических блоков —
