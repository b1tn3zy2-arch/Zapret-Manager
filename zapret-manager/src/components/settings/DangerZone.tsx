// Импортируем зависимости из модуля react.
import { useState } from "react";
// Импортируем зависимости из модуля lucide-react.
import { PowerOff, Trash2 } from "lucide-react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/components/ui.
import { Button, Input, Modal, Text } from "@/components/ui";
// Импортируем зависимости из модуля @/i18n.
import { useI18n } from "@/i18n";
// Импортируем зависимости из модуля @/hooks/useSystemInfo.
import {
  // Подключаем именованный импорт deleteAllBackups.
  deleteAllBackups,
  // Подключаем именованный импорт deleteAllLogs.
  deleteAllLogs,
  // Подключаем именованный импорт fullUninstall.
  fullUninstall,
  // Подключаем именованный импорт quitApp.
  quitApp,
  // Закрываем текущий блок.
} from "@/hooks/useSystemInfo";
// Импортируем зависимости из модуля @/lib/utils.
import { toErrorMessage } from "@/lib/utils";
// Импортируем зависимости из модуля @/stores/useLogsStore.
import { useLogsStore } from "@/stores/useLogsStore";
// Импортируем зависимости из модуля @/stores/useSettingsStore.
import { useSettingsStore } from "@/stores/useSettingsStore";
// — разделитель логических блоков —

// Обрабатываем конструкцию: const DANGER_CONFIRM = DELETE.
const DANGER_CONFIRM = "DELETE";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export type DangerAction = "reset" | "logs" | "backups" | "uninstall";
// — разделитель логических блоков —

// Объявляем функцию DangerZone.
function DangerZone() {
  // Обрабатываем конструкцию: const { t } = useI18n().
  const { t } = useI18n();
  // Обрабатываем конструкцию: const folder = useSettingsStore((state) => state.settin….
  const folder = useSettingsStore((state) => state.settings.strategiesFolder);
  // Обрабатываем конструкцию: const resetToDefaults = useSettingsStore((state) => sta….
  const resetToDefaults = useSettingsStore((state) => state.resetToDefaults);
  // Обрабатываем конструкцию: const saveToFile = useSettingsStore((state) => state.sa….
  const saveToFile = useSettingsStore((state) => state.saveToFile);
  // Обрабатываем конструкцию: const loadFromFile = useSettingsStore((state) => state.….
  const loadFromFile = useSettingsStore((state) => state.loadFromFile);
  // Обрабатываем конструкцию: const clearLogs = useLogsStore((state) => state.clearLo….
  const clearLogs = useLogsStore((state) => state.clearLogs);
  // Обрабатываем конструкцию: const addLog = useLogsStore((state) => state.addLog).
  const addLog = useLogsStore((state) => state.addLog);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const [danger, setDanger] = useState<DangerAction | nul….
  const [danger, setDanger] = useState<DangerAction | null>(null);
  // Обрабатываем конструкцию: const [confirm, setConfirm] = useState().
  const [confirm, setConfirm] = useState("");
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const open = (action: DangerAction): void => { setDange….
  const open = (action: DangerAction): void => {
    // Обрабатываем конструкцию: setDanger.
    setDanger(action);
    // Обрабатываем конструкцию: setConfirm.
    setConfirm("");
    // Закрываем текущий блок.
  };
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const close = (): void => { setDanger(null); setConfirm….
  const close = (): void => {
    // Обрабатываем конструкцию: setDanger.
    setDanger(null);
    // Обрабатываем конструкцию: setConfirm.
    setConfirm("");
    // Закрываем текущий блок.
  };
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const confirmDanger = async (): Promise<void> => { if (….
  const confirmDanger = async (): Promise<void> => {
    // Проверяем бизнес-условие: danger === null || confirm !== DANGER_CONFIRM.
    if (danger === null || confirm !== DANGER_CONFIRM) {
      // Завершаем функцию без возвращаемого значения.
      return;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Проверяем бизнес-условие: danger === reset.
    if (danger === "reset") {
      // Сохраняем пояснение разработчика: // Сброс обязан уйти в settings.json: раньше менялась только…
      // Сброс обязан уйти в settings.json: раньше менялась только память,
      // Сохраняем пояснение разработчика: // и при следующем запуске приложение подхватывало старый фа…
      // и при следующем запуске приложение подхватывало старый файл обратно.
      // Обрабатываем конструкцию: resetToDefaults.
      resetToDefaults();
      // Обрабатываем конструкцию: const saved = await saveToFile().
      const saved = await saveToFile();
      // — разделитель логических блоков —

      // Проверяем бизнес-условие: !saved.
      if (!saved) {
        // Обрабатываем конструкцию: addLog.
        addLog({
          // Обрабатываем конструкцию: level.
          level: "error",
          // Обрабатываем конструкцию: source.
          source: "user",
          // Обрабатываем конструкцию: message.
          message: t("settings.common.resetFailed"),
          // Закрываем текущий блок.
        });
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Ожидаем завершение асинхронной операции await loadFromFile().
      await loadFromFile();
      // Обрабатываем конструкцию: addLog.
      addLog({
        // Обрабатываем конструкцию: level.
        level: "warn",
        // Обрабатываем конструкцию: source.
        source: "user",
        // Обрабатываем конструкцию: message.
        message: t("settings.common.resetDone"),
        // Закрываем текущий блок.
      });
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Проверяем бизнес-условие: danger === logs.
    if (danger === "logs") {
      // Сохраняем пояснение разработчика: // Файлы журналов удаляются с диска: иначе winws-логи и журн…
      // Файлы журналов удаляются с диска: иначе winws-логи и журнал
      // Сохраняем пояснение разработчика: // приложения возвращались при следующем старте.
      // приложения возвращались при следующем старте.
      // Пробуем выполнить блок с обработкой ошибок.
      try {
        // Обрабатываем конструкцию: const removed = await deleteAllLogs().
        const removed = await deleteAllLogs();
        // Обрабатываем конструкцию: clearLogs.
        clearLogs();
        // Обрабатываем конструкцию: addLog.
        addLog({
          // Обрабатываем конструкцию: level.
          level: "warn",
          // Обрабатываем конструкцию: source.
          source: "user",
          // Обрабатываем конструкцию: message.
          message: t("settings.common.logsRemoved", { count: removed }),
          // Закрываем текущий блок.
        });
        // Закрываем текущий блок.
      } catch (caught) {
        // Обрабатываем конструкцию: addLog.
        addLog({
          // Обрабатываем конструкцию: level.
          level: "error",
          // Обрабатываем конструкцию: source.
          source: "user",
          // Обрабатываем конструкцию: message.
          message: t("settings.common.logsRemoveFailed", {
            // Обрабатываем конструкцию: error.
            error: toErrorMessage(caught),
            // Закрываем текущий блок.
          }),
          // Закрываем текущий блок.
        });
        // Закрываем текущий блок.
      }
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Проверяем бизнес-условие: danger === backups && folder !==.
    if (danger === "backups" && folder !== "") {
      // Пробуем выполнить блок с обработкой ошибок.
      try {
        // Обрабатываем конструкцию: const removed = await deleteAllBackups(folder).
        const removed = await deleteAllBackups(folder);
        // Обрабатываем конструкцию: addLog.
        addLog({
          // Обрабатываем конструкцию: level.
          level: "warn",
          // Обрабатываем конструкцию: source.
          source: "user",
          // Обрабатываем конструкцию: message.
          message: t("settings.common.backupsRemoved", { count: removed }),
          // Закрываем текущий блок.
        });
        // Закрываем текущий блок.
      } catch (caught) {
        // Обрабатываем конструкцию: addLog.
        addLog({
          // Обрабатываем конструкцию: level.
          level: "error",
          // Обрабатываем конструкцию: source.
          source: "user",
          // Обрабатываем конструкцию: message.
          message: t("settings.common.backupsRemoveFailed", {
            // Обрабатываем конструкцию: error.
            error: toErrorMessage(caught),
            // Закрываем текущий блок.
          }),
          // Закрываем текущий блок.
        });
        // Закрываем текущий блок.
      }
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Проверяем бизнес-условие: danger === uninstall.
    if (danger === "uninstall") {
      // Сохраняем пояснение разработчика: // Деинсталлятор закрывает приложение и удаляет всё, включая…
      // Деинсталлятор закрывает приложение и удаляет всё, включая профиль.
      // Сохраняем пояснение разработчика: // Портативная сборка установщика не имеет — тогда сообщаем …
      // Портативная сборка установщика не имеет — тогда сообщаем честно.
      // Пробуем выполнить блок с обработкой ошибок.
      try {
        // Ожидаем завершение асинхронной операции await fullUninstall().
        await fullUninstall();
        // Ожидаем завершение асинхронной операции await quitApp().
        await quitApp();
        // Закрываем текущий блок.
      } catch (caught) {
        // Обрабатываем конструкцию: addLog.
        addLog({
          // Обрабатываем конструкцию: level.
          level: "error",
          // Обрабатываем конструкцию: source.
          source: "user",
          // Обрабатываем конструкцию: message.
          message: toErrorMessage(caught),
          // Закрываем текущий блок.
        });
        // — разделитель логических блоков —

        // Обрабатываем конструкцию: close.
        close();
        // — разделитель логических блоков —

        // Завершаем функцию без возвращаемого значения.
        return;
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Завершаем функцию без возвращаемого значения.
      return;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: close.
    close();
    // Закрываем текущий блок.
  };
  // — разделитель логических блоков —

  // Возвращаем результат: ( <> <div className=flex flex-col gap-3 py-3> <div clas….
  return (
    // Обрабатываем конструкцию: <>.
    <>
      {/* Выводим текстовое содержимое в JSX. */}
      <div className="flex flex-col gap-3 py-3">
        {/* Выводим текстовое содержимое в JSX. */}
        <div className="flex flex-col gap-1">
          {/* Выводим текстовое содержимое в JSX. */}
          <Text variant="label" className="text-accent-danger">
            {/* Выводим текстовое содержимое в JSX. */}
            {t("settings.advanced.danger")}
            {/* Выводим текстовое содержимое в JSX. */}
          </Text>
          {/* Выводим текстовое содержимое в JSX. */}
          <Text variant="caption" size="sm" className="text-text-tertiary">
            {/* Выводим текстовое содержимое в JSX. */}
            {t("settings.advanced.dangerHint")}
            {/* Выводим текстовое содержимое в JSX. */}
          </Text>
          {/* Выводим текстовое содержимое в JSX. */}
        </div>
        {/* — разделитель логических блоков — */}

        {/* Выводим текстовое содержимое в JSX. */}
        <div className="flex flex-wrap gap-2">
          {/* Выводим текстовое содержимое в JSX. */}
          <Button
            // Обрабатываем конструкцию: size.
            size="sm"
            // Обрабатываем конструкцию: variant.
            variant="danger"
            // Обрабатываем конструкцию: onClick.
            onClick={() => {
              // Обрабатываем конструкцию: open.
              open("reset");
              // Закрываем текущий блок.
            }}
            // Продолжаем выражение.
          >
            {/* Выводим текстовое содержимое в JSX. */}
            {t("settings.advanced.resetAll")}
            {/* Выводим текстовое содержимое в JSX. */}
          </Button>
          {/* Выводим текстовое содержимое в JSX. */}
          <Button
            // Обрабатываем конструкцию: size.
            size="sm"
            // Обрабатываем конструкцию: variant.
            variant="danger"
            // Обрабатываем конструкцию: onClick.
            onClick={() => {
              // Обрабатываем конструкцию: open.
              open("logs");
              // Закрываем текущий блок.
            }}
            // Продолжаем выражение.
          >
            {/* Выводим текстовое содержимое в JSX. */}
            {t("settings.advanced.clearLogs")}
            {/* Выводим текстовое содержимое в JSX. */}
          </Button>
          {/* Выводим текстовое содержимое в JSX. */}
          <Button
            // Обрабатываем конструкцию: size.
            size="sm"
            // Обрабатываем конструкцию: variant.
            variant="danger"
            // Обрабатываем конструкцию: disabled.
            disabled={folder === ""}
            // Обрабатываем конструкцию: onClick.
            onClick={() => {
              // Обрабатываем конструкцию: open.
              open("backups");
              // Закрываем текущий блок.
            }}
            // Обрабатываем конструкцию: icon.
            icon={<Trash2 aria-hidden="true" className="size-4" />}
            // Продолжаем выражение.
          >
            {/* Выводим текстовое содержимое в JSX. */}
            {t("settings.advanced.deleteBackups")}
            {/* Выводим текстовое содержимое в JSX. */}
          </Button>
          {/* Выводим текстовое содержимое в JSX. */}
          <Button
            // Обрабатываем конструкцию: size.
            size="sm"
            // Обрабатываем конструкцию: variant.
            variant="danger"
            // Обрабатываем конструкцию: onClick.
            onClick={() => {
              // Обрабатываем конструкцию: open.
              open("uninstall");
              // Закрываем текущий блок.
            }}
            // Обрабатываем конструкцию: icon.
            icon={<PowerOff aria-hidden="true" className="size-4" />}
            // Продолжаем выражение.
          >
            {/* Выводим текстовое содержимое в JSX. */}
            {t("settings.advanced.uninstallApp")}
            {/* Выводим текстовое содержимое в JSX. */}
          </Button>
          {/* Выводим текстовое содержимое в JSX. */}
        </div>
        {/* Выводим текстовое содержимое в JSX. */}
      </div>
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <Modal
        // Обрабатываем конструкцию: open.
        open={danger !== null}
        // Обрабатываем конструкцию: onClose.
        onClose={close}
        // Обрабатываем конструкцию: title.
        title={t(
          // Обрабатываем конструкцию: danger.
          danger === "uninstall"
            ? // Обрабатываем конструкцию: ?.
              // Продолжаем предыдущую конструкцию.
              "settings.advanced.uninstallTitle"
            : // Обрабатываем конструкцию: :.
              // Продолжаем предыдущую конструкцию.
              "settings.advanced.danger"
          // Закрываем выражение или список аргументов.
        )}
        // Обрабатываем конструкцию: description.
        description={t(
          // Обрабатываем конструкцию: danger.
          danger === "uninstall"
            ? // Обрабатываем конструкцию: ?.
              // Продолжаем предыдущую конструкцию.
              "settings.advanced.uninstallHint"
            : // Обрабатываем конструкцию: :.
              // Продолжаем предыдущую конструкцию.
              "settings.common.deleteConfirmPlaceholder"
          // Закрываем выражение или список аргументов.
        )}
        // Обрабатываем конструкцию: size.
        size="sm"
        // Обрабатываем конструкцию: footer.
        footer={
          // Обрабатываем конструкцию: <>.
          <>
            {/* Выводим текстовое содержимое в JSX. */}
            <Button variant="ghost" onClick={close}>
              {/* Выводим текстовое содержимое в JSX. */}
              {t("settings.common.cancel")}
              {/* Выводим текстовое содержимое в JSX. */}
            </Button>
            {/* Выводим текстовое содержимое в JSX. */}
            <Button
              // Обрабатываем конструкцию: variant.
              variant="danger"
              // Обрабатываем конструкцию: disabled.
              disabled={confirm !== DANGER_CONFIRM}
              // Обрабатываем конструкцию: onClick.
              onClick={() => {
                // Обрабатываем конструкцию: void confirmDanger().
                void confirmDanger();
                // Закрываем текущий блок.
              }}
              // Продолжаем выражение.
            >
              {/* Выводим текстовое содержимое в JSX. */}
              {t("settings.common.confirm")}
              {/* Выводим текстовое содержимое в JSX. */}
            </Button>
            {/* Выводим текстовое содержимое в JSX. */}
          </>
          // Закрываем текущий блок.
        }
        // Продолжаем выражение.
      >
        {/* Выводим текстовое содержимое в JSX. */}
        <Input
          // Обрабатываем конструкцию: variant.
          variant="filled"
          // Обрабатываем конструкцию: value.
          value={confirm}
          // Обрабатываем конструкцию: placeholder.
          placeholder={DANGER_CONFIRM}
          // Обрабатываем конструкцию: aria-label.
          aria-label={t("settings.common.confirm")}
          // Обрабатываем конструкцию: onChange.
          onChange={(event) => {
            // Обрабатываем конструкцию: setConfirm.
            setConfirm(event.target.value);
            // Закрываем текущий блок.
          }}
          // Продолжаем выражение.
        />
        {/* Выводим текстовое содержимое в JSX. */}
      </Modal>
      {/* Выводим текстовое содержимое в JSX. */}
    </>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export default DangerZone;.
export default DangerZone;
// — разделитель логических блоков —
