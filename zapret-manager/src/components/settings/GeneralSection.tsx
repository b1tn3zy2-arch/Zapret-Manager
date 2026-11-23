// Импортируем зависимости из модуля @tauri-apps/plugin-autostart.
import { enable, disable, isEnabled } from "@tauri-apps/plugin-autostart";
// — разделитель логических блоков —

// Импортируем зависимости из модуля react.
import { useEffect, useMemo, useState } from "react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/components/ui/Dropdown.
import Dropdown from "@/components/ui/Dropdown";
// Импортируем зависимости из модуля @/components/settings/SectionContainer.
import SectionContainer from "@/components/settings/SectionContainer";
// Импортируем зависимости из модуля @/components/settings/SettingRow.
import SettingRow from "@/components/settings/SettingRow";
// Импортируем зависимости из модуля @/components/ui.
import { Text } from "@/components/ui";
// Импортируем зависимости из модуля @/components/ui.
import { Toggle } from "@/components/ui";
// Импортируем зависимости из модуля @/i18n.
import { useI18n } from "@/i18n";
// Импортируем зависимости из модуля @/i18n/types.
import type { TranslationKey } from "@/i18n/types";
// Импортируем зависимости из модуля @/lib/constants.
import { ROUTES } from "@/lib/constants";
// Импортируем зависимости из модуля @/lib/utils.
import { toErrorMessage } from "@/lib/utils";
// Импортируем зависимости из модуля @/lib/secureInvoke.
import { secureInvoke } from "@/lib/secureInvoke";
// Импортируем зависимости из модуля @/stores/useLogsStore.
import { useLogsStore } from "@/stores/useLogsStore";
// Импортируем зависимости из модуля @/stores/useAppStore.
import { useAppStore } from "@/stores/useAppStore";
// Импортируем зависимости из модуля @/stores/useSettingsStore.
import { useSettingsStore } from "@/stores/useSettingsStore";
// Импортируем зависимости из модуля @/types.
import type { Language, NotificationChannel } from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: const LANGUAGE_OPTIONS = [ { value: ru, labelKey: setti….
const LANGUAGE_OPTIONS = [
  // Открываем объектный литерал.
  { value: "ru", labelKey: "settings.general.languageRu" },
  // Открываем объектный литерал.
  { value: "en", labelKey: "settings.general.languageEn" },
  // Закрываем массив или список.
] as const satisfies readonly { value: Language; labelKey: TranslationKey }[];
// — разделитель логических блоков —

// Обрабатываем конструкцию: const CHANNEL_OPTIONS = [ { value: app, labelKey: setti….
const CHANNEL_OPTIONS = [
  // Открываем объектный литерал.
  { value: "app", labelKey: "settings.general.showInApp" },
  // Открываем объектный литерал.
  { value: "windows", labelKey: "settings.general.showInWindows" },
  // Закрываем массив или список.
] as const satisfies readonly {
  // Обрабатываем конструкцию: value.
  value: NotificationChannel;
  // Обрабатываем конструкцию: labelKey.
  labelKey: TranslationKey;
  // Закрываем текущий блок.
}[];
// — разделитель логических блоков —

// Объявляем функцию GeneralSection.
function GeneralSection() {
  // Обрабатываем конструкцию: const { t } = useI18n().
  const { t } = useI18n();
  // Обрабатываем конструкцию: const general = useSettingsStore((state) => state.setti….
  const general = useSettingsStore((state) => state.settings.general);
  // Обрабатываем конструкцию: const updateGeneral = useSettingsStore((state) => state….
  const updateGeneral = useSettingsStore((state) => state.updateGeneral);
  // Обрабатываем конструкцию: const addLog = useLogsStore((state) => state.addLog).
  const addLog = useLogsStore((state) => state.addLog);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const [systemToasts, setSystemToasts] = useState(true).
  const [systemToasts, setSystemToasts] = useState(true);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: useEffect.
  useEffect(() => {
    // Обрабатываем конструкцию: void secureInvoke<boolean>(system_toasts_enabled) .then….
    void secureInvoke<boolean>("system_toasts_enabled")
      // Продолжаем цепочку вызовов.
      .then((value) => {
        // Обрабатываем конструкцию: setSystemToasts.
        setSystemToasts(value);
        // Закрываем текущий блок.
      })
      // Продолжаем цепочку вызовов.
      .catch(() => undefined);
    // Закрываем текущий блок.
  }, []);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const languageOptions = useMemo( () => LANGUAGE_OPTIONS….
  const languageOptions = useMemo(
    // Объявляем функцию-обработчик или стрелочную функцию.
    () =>
      // Обрабатываем конструкцию: LANGUAGE_OPTIONS.
      LANGUAGE_OPTIONS.map((option) => ({
        // Обрабатываем конструкцию: value.
        value: option.value,
        // Обрабатываем конструкцию: label.
        label: t(option.labelKey),
        // Закрываем текущий блок.
      })),
    // Открываем массив.
    [t]
    // Закрываем выражение или список аргументов.
  );
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const channelOptions = useMemo( () => CHANNEL_OPTIONS.m….
  const channelOptions = useMemo(
    // Объявляем функцию-обработчик или стрелочную функцию.
    () =>
      // Обрабатываем конструкцию: CHANNEL_OPTIONS.
      CHANNEL_OPTIONS.map((option) => ({
        // Обрабатываем конструкцию: value.
        value: option.value,
        // Обрабатываем конструкцию: label.
        label: t(option.labelKey),
        // Закрываем текущий блок.
      })),
    // Открываем массив.
    [t]
    // Закрываем выражение или список аргументов.
  );
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const [autoStart, setAutoStart] = useState(general.auto….
  const [autoStart, setAutoStart] = useState(general.autoStart);
  // Обрабатываем конструкцию: const [autoStartBusy, setAutoStartBusy] = useState(fals….
  const [autoStartBusy, setAutoStartBusy] = useState(false);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: useEffect.
  useEffect(() => {
    // Обрабатываем конструкцию: let cancelled = false.
    let cancelled = false;
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: void isEnabled() .then((value) => { if (!cancelled) { s….
    void isEnabled()
      // Продолжаем цепочку вызовов.
      .then((value) => {
        // Проверяем бизнес-условие: !cancelled.
        if (!cancelled) {
          // Обрабатываем конструкцию: setAutoStart.
          setAutoStart(value);
          // Проверяем бизнес-условие: value !== general.autoStart.
          if (value !== general.autoStart) {
            // Обрабатываем конструкцию: updateGeneral.
            updateGeneral({ autoStart: value });
            // Закрываем текущий блок.
          }
          // Закрываем текущий блок.
        }
        // Закрываем текущий блок.
      })
      // Продолжаем цепочку вызовов.
      .catch(() => {
        // Завершаем функцию без возвращаемого значения.
        return;
        // Закрываем текущий блок.
      });
    // — разделитель логических блоков —

    // Возвращаем результат: () => { cancelled = true; }.
    return () => {
      // Обрабатываем конструкцию: cancelled.
      cancelled = true;
      // Закрываем текущий блок.
    };
    // Закрываем текущий блок.
  }, [general.autoStart, updateGeneral]);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const changeAutoStart = async (value: boolean): Promise….
  const changeAutoStart = async (value: boolean): Promise<void> => {
    // Обрабатываем конструкцию: setAutoStartBusy.
    setAutoStartBusy(true);
    // — разделитель логических блоков —

    // Пробуем выполнить блок с обработкой ошибок.
    try {
      // Проверяем бизнес-условие: value.
      if (value) {
        // Ожидаем завершение асинхронной операции await enable().
        await enable();
        // Закрываем текущий блок.
      } else {
        // Ожидаем завершение асинхронной операции await disable().
        await disable();
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: setAutoStart.
      setAutoStart(value);
      // Обрабатываем конструкцию: updateGeneral.
      updateGeneral({ autoStart: value });
      // Обрабатываем конструкцию: addLog.
      addLog({
        // Обрабатываем конструкцию: level.
        level: "info",
        // Обрабатываем конструкцию: source.
        source: "user",
        // Обрабатываем конструкцию: message.
        message: value
          ? // Обрабатываем конструкцию: ?.
            // Продолжаем предыдущую конструкцию.
            t("settings.general.autoStartOn")
          : // Обрабатываем конструкцию: :.
            // Продолжаем предыдущую конструкцию.
            t("settings.general.autoStartOff"),
        // Закрываем текущий блок.
      });
      // Закрываем текущий блок.
    } catch (caught) {
      // Обрабатываем конструкцию: const message = toErrorMessage(caught).
      const message = toErrorMessage(caught);
      // Обрабатываем конструкцию: setAutoStart.
      setAutoStart(!value);
      // Обрабатываем конструкцию: addLog.
      addLog({
        // Обрабатываем конструкцию: level.
        level: "error",
        // Обрабатываем конструкцию: source.
        source: "user",
        // Обрабатываем конструкцию: message.
        message: t("settings.general.autoStartFailed", { error: message }),
        // Закрываем текущий блок.
      });
      // Закрываем текущий блок.
    } finally {
      // Обрабатываем конструкцию: setAutoStartBusy.
      setAutoStartBusy(false);
      // Закрываем текущий блок.
    }
    // Закрываем текущий блок.
  };
  // — разделитель логических блоков —

  // Возвращаем результат: ( <SectionContainer title={t(settings.general.title)} d….
  return (
    // Обрабатываем конструкцию: <SectionContainer title={t(settings.general.title)} des….
    <SectionContainer
      // Обрабатываем конструкцию: title.
      title={t("settings.general.title")}
      // Обрабатываем конструкцию: description.
      description={t("settings.general.description")}
      // Обрабатываем конструкцию: onReset.
      onReset={() => {
        // Обрабатываем конструкцию: updateGeneral.
        updateGeneral({
          // Обрабатываем конструкцию: language.
          language: "ru",
          // Обрабатываем конструкцию: autoStart.
          autoStart: false,
          // Обрабатываем конструкцию: minimizeToTray.
          minimizeToTray: true,
          // Обрабатываем конструкцию: startMinimized.
          startMinimized: false,
          // Обрабатываем конструкцию: showNotifications.
          showNotifications: true,
          // Обрабатываем конструкцию: notificationChannel.
          notificationChannel: "app",
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
        // Обрабатываем конструкцию: label.
        label={t("settings.general.language")}
        // Обрабатываем конструкцию: description.
        description={t("settings.general.languageHint")}
        // Обрабатываем конструкцию: control.
        control={
          // Рендерим самозакрывающийся элемент Dropdown.
          <Dropdown
            // Обрабатываем конструкцию: label.
            label={t("settings.general.language")}
            // Обрабатываем конструкцию: value.
            value={general.language}
            // Обрабатываем конструкцию: options.
            options={languageOptions}
            // Обрабатываем конструкцию: onChange.
            onChange={(language) => {
              // Обрабатываем конструкцию: updateGeneral.
              updateGeneral({ language });
              // Закрываем текущий блок.
            }}
            // Продолжаем выражение.
          />
          // Закрываем текущий блок.
        }
        // Продолжаем выражение.
      />
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <SettingRow
        // Обрабатываем конструкцию: label.
        label={t("settings.general.autoStart")}
        // Обрабатываем конструкцию: description.
        description={t("settings.general.autoStartHint")}
        // Обрабатываем конструкцию: disabled.
        disabled={autoStartBusy}
        // Обрабатываем конструкцию: control.
        control={
          // Рендерим самозакрывающийся элемент Toggle.
          <Toggle
            // Обрабатываем конструкцию: ariaLabel.
            ariaLabel={t("settings.general.autoStart")}
            // Обрабатываем конструкцию: checked.
            checked={autoStart}
            // Обрабатываем конструкцию: disabled.
            disabled={autoStartBusy}
            // Обрабатываем конструкцию: onChange.
            onChange={(value) => {
              // Обрабатываем конструкцию: void changeAutoStart(value).
              void changeAutoStart(value);
              // Закрываем текущий блок.
            }}
            // Продолжаем выражение.
          />
          // Закрываем текущий блок.
        }
        // Продолжаем выражение.
      />
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <SettingRow
        // Обрабатываем конструкцию: label.
        label={t("settings.general.minimizeToTray")}
        // Обрабатываем конструкцию: control.
        control={
          // Рендерим самозакрывающийся элемент Toggle.
          <Toggle
            // Обрабатываем конструкцию: ariaLabel.
            ariaLabel={t("settings.general.minimizeToTray")}
            // Обрабатываем конструкцию: checked.
            checked={general.minimizeToTray}
            // Обрабатываем конструкцию: onChange.
            onChange={(value) => {
              // Обрабатываем конструкцию: updateGeneral.
              updateGeneral({ minimizeToTray: value });
              // Закрываем текущий блок.
            }}
            // Продолжаем выражение.
          />
          // Закрываем текущий блок.
        }
        // Продолжаем выражение.
      />
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <SettingRow
        // Обрабатываем конструкцию: label.
        label={t("settings.general.startMinimized")}
        // Обрабатываем конструкцию: control.
        control={
          // Рендерим самозакрывающийся элемент Toggle.
          <Toggle
            // Обрабатываем конструкцию: ariaLabel.
            ariaLabel={t("settings.general.startMinimized")}
            // Обрабатываем конструкцию: checked.
            checked={general.startMinimized}
            // Обрабатываем конструкцию: onChange.
            onChange={(value) => {
              // Обрабатываем конструкцию: updateGeneral.
              updateGeneral({ startMinimized: value });
              // Закрываем текущий блок.
            }}
            // Продолжаем выражение.
          />
          // Закрываем текущий блок.
        }
        // Продолжаем выражение.
      />
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <SettingRow
        // Обрабатываем конструкцию: label.
        label={t("settings.general.enableLogs")}
        // Обрабатываем конструкцию: description.
        description={t("settings.general.enableLogsHint")}
        // Обрабатываем конструкцию: control.
        control={
          // Рендерим самозакрывающийся элемент Toggle.
          <Toggle
            // Обрабатываем конструкцию: ariaLabel.
            ariaLabel={t("settings.general.enableLogs")}
            // Обрабатываем конструкцию: checked.
            checked={general.enableLogs}
            // Обрабатываем конструкцию: onChange.
            onChange={(value) => {
              // Обрабатываем конструкцию: updateGeneral.
              updateGeneral({ enableLogs: value });
              // — разделитель логических блоков —

              // Проверяем бизнес-условие: !value.
              if (!value) {
                // Обрабатываем конструкцию: useLogsStore.
                useLogsStore.getState().clearLogs();
                // Обрабатываем конструкцию: useAppStore.
                useAppStore.getState().setActivePage(ROUTES.dashboard);
                // Закрываем текущий блок.
              }
              // Закрываем текущий блок.
            }}
            // Продолжаем выражение.
          />
          // Закрываем текущий блок.
        }
        // Продолжаем выражение.
      />
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <SettingRow
        // Обрабатываем конструкцию: label.
        label={t("settings.general.showNotifications")}
        // Обрабатываем конструкцию: description.
        description={t("settings.general.showNotificationsHint")}
        // Обрабатываем конструкцию: control.
        control={
          // Рендерим самозакрывающийся элемент Toggle.
          <Toggle
            // Обрабатываем конструкцию: ariaLabel.
            ariaLabel={t("settings.general.showNotifications")}
            // Обрабатываем конструкцию: checked.
            checked={general.showNotifications}
            // Обрабатываем конструкцию: onChange.
            onChange={(value) => {
              // Обрабатываем конструкцию: updateGeneral.
              updateGeneral({ showNotifications: value });
              // Закрываем текущий блок.
            }}
            // Продолжаем выражение.
          />
          // Закрываем текущий блок.
        }
        // Продолжаем выражение.
      />
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      {systemToasts && general.showNotifications ? (
        // Обрабатываем конструкцию: <Text variant=caption size=sm className=text-accent-war….
        <Text variant="caption" size="sm" className="text-accent-warning">
          {/* Выводим текстовое содержимое в JSX. */}
          {t("settings.general.toastsDisabledHint")}
          {/* Выводим текстовое содержимое в JSX. */}
        </Text>
      ) : // Закрываем выражение или список аргументов.
      // Продолжаем предыдущую конструкцию.
      null}
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      {general.showNotifications ? (
        // Обрабатываем конструкцию: <>.
        <>
          {/* Выводим текстовое содержимое в JSX. */}
          <SettingRow
            // Обрабатываем конструкцию: label.
            label={t("settings.general.showIn")}
            // Обрабатываем конструкцию: description.
            description={t("settings.general.showInHint")}
            // Обрабатываем конструкцию: control.
            control={
              // Рендерим самозакрывающийся элемент Dropdown.
              <Dropdown
                // Обрабатываем конструкцию: label.
                label={t("settings.general.showIn")}
                // Обрабатываем конструкцию: value.
                value={general.notificationChannel}
                // Обрабатываем конструкцию: options.
                options={channelOptions}
                // Обрабатываем конструкцию: onChange.
                onChange={(channel) => {
                  // Обрабатываем конструкцию: updateGeneral.
                  updateGeneral({ notificationChannel: channel });
                  // Закрываем текущий блок.
                }}
                // Продолжаем выражение.
              />
              // Закрываем текущий блок.
            }
            // Продолжаем выражение.
          />
          {/* — разделитель логических блоков — */}

          {/* Выводим текстовое содержимое в JSX. */}
          <SettingRow
            // Обрабатываем конструкцию: label.
            label={t("settings.general.notifyOnStart")}
            // Обрабатываем конструкцию: description.
            description={t("settings.general.notifyOnStartHint")}
            // Обрабатываем конструкцию: control.
            control={
              // Рендерим самозакрывающийся элемент Toggle.
              <Toggle
                // Обрабатываем конструкцию: ariaLabel.
                ariaLabel={t("settings.general.notifyOnStart")}
                // Обрабатываем конструкцию: checked.
                checked={general.showNotificationsOnStart}
                // Обрабатываем конструкцию: onChange.
                onChange={(value) => {
                  // Обрабатываем конструкцию: updateGeneral.
                  updateGeneral({ showNotificationsOnStart: value });
                  // Закрываем текущий блок.
                }}
                // Продолжаем выражение.
              />
              // Закрываем текущий блок.
            }
            // Продолжаем выражение.
          />
          {/* — разделитель логических блоков — */}

          {/* Выводим текстовое содержимое в JSX. */}
          <SettingRow
            // Обрабатываем конструкцию: label.
            label={t("settings.general.notifyOnStop")}
            // Обрабатываем конструкцию: description.
            description={t("settings.general.notifyOnStopHint")}
            // Обрабатываем конструкцию: control.
            control={
              // Рендерим самозакрывающийся элемент Toggle.
              <Toggle
                // Обрабатываем конструкцию: ariaLabel.
                ariaLabel={t("settings.general.notifyOnStop")}
                // Обрабатываем конструкцию: checked.
                checked={general.showNotificationsOnStop}
                // Обрабатываем конструкцию: onChange.
                onChange={(value) => {
                  // Обрабатываем конструкцию: updateGeneral.
                  updateGeneral({ showNotificationsOnStop: value });
                  // Закрываем текущий блок.
                }}
                // Продолжаем выражение.
              />
              // Закрываем текущий блок.
            }
            // Продолжаем выражение.
          />
          {/* — разделитель логических блоков — */}

          {/* Выводим текстовое содержимое в JSX. */}
          <SettingRow
            // Обрабатываем конструкцию: label.
            label={t("settings.general.notifyOnUpdate")}
            // Обрабатываем конструкцию: description.
            description={t("settings.general.notifyOnUpdateHint")}
            // Обрабатываем конструкцию: control.
            control={
              // Рендерим самозакрывающийся элемент Toggle.
              <Toggle
                // Обрабатываем конструкцию: ariaLabel.
                ariaLabel={t("settings.general.notifyOnUpdate")}
                // Обрабатываем конструкцию: checked.
                checked={general.showUpdateNotifications}
                // Обрабатываем конструкцию: onChange.
                onChange={(value) => {
                  // Обрабатываем конструкцию: updateGeneral.
                  updateGeneral({ showUpdateNotifications: value });
                  // Закрываем текущий блок.
                }}
                // Продолжаем выражение.
              />
              // Закрываем текущий блок.
            }
            // Продолжаем выражение.
          />
          {/* Выводим текстовое содержимое в JSX. */}
        </>
      ) : // Закрываем выражение или список аргументов.
      // Продолжаем предыдущую конструкцию.
      null}
      {/* Выводим текстовое содержимое в JSX. */}
    </SectionContainer>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export default GeneralSection;.
export default GeneralSection;
// — разделитель логических блоков —
