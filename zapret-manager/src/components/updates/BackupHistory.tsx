// Импортируем зависимости из модуля react.
import { useCallback, useEffect, useState } from "react";
// Импортируем зависимости из модуля @/i18n.
import { useI18n } from "@/i18n";
// Импортируем зависимости из модуля lucide-react.
import { History, RotateCcw } from "lucide-react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/components/ui.
import { Button } from "@/components/ui";
// Импортируем зависимости из модуля @/hooks/useUpdater.
import { useUpdater } from "@/hooks/useUpdater";
// Импортируем зависимости из модуля @/lib/trafficUtils.
import { formatBytes } from "@/lib/trafficUtils";
// Импортируем зависимости из модуля @/lib/updateUtils.
import { formatVersion } from "@/lib/updateUtils";
// Импортируем зависимости из модуля @/types.
import type { UpdateBackupInfo } from "@/types";
// — разделитель логических блоков —

// Объявляем функцию BackupHistory.
function BackupHistory() {
  // Обрабатываем конструкцию: const { t } = useI18n().
  const { t } = useI18n();
  // Обрабатываем конструкцию: const { loadBackups, rollback } = useUpdater().
  const { loadBackups, rollback } = useUpdater();
  // Обрабатываем конструкцию: const [backups, setBackups] = useState<UpdateBackupInfo….
  const [backups, setBackups] = useState<UpdateBackupInfo[]>([]);
  // Обрабатываем конструкцию: const [isBusy, setIsBusy] = useState(false).
  const [isBusy, setIsBusy] = useState(false);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const refresh = useCallback(() => { void loadBackups().….
  const refresh = useCallback(() => {
    // Обрабатываем конструкцию: void loadBackups().then(setBackups).
    void loadBackups().then(setBackups);
    // Закрываем текущий блок.
  }, [loadBackups]);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: useEffect.
  useEffect(() => {
    // Обрабатываем конструкцию: refresh.
    refresh();
    // Закрываем текущий блок.
  }, [refresh]);
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: backups.length === 0.
  if (backups.length === 0) {
    // Возвращаем результат: ( <p className=text-text-tertiary text-xs>{t(updates.ba….
    return (
      // Обрабатываем конструкцию: <p className=text-text-tertiary text-xs>.
      <p className="text-text-tertiary text-xs">{t("updates.backupEmpty")}</p>
      // Закрываем выражение или список аргументов.
    );
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: ( <div className=flex flex-col gap-2> {backups.map((bac….
  return (
    // Обрабатываем конструкцию: <div className=flex flex-col gap-2>.
    <div className="flex flex-col gap-2">
      {/* Выводим текстовое содержимое в JSX. */}
      {backups.map((backup) => (
        // Обрабатываем конструкцию: <div key={backup.path} className=border-glass-border bg….
        <div
          // Обрабатываем конструкцию: key.
          key={backup.path}
          // Обрабатываем конструкцию: className.
          className="border-glass-border bg-bg-secondary/40 flex items-center justify-between gap-3 rounded-lg border px-3 py-2"
          // Продолжаем выражение.
        >
          {/* Выводим текстовое содержимое в JSX. */}
          <span className="flex items-center gap-2 text-xs">
            {/* Выводим текстовое содержимое в JSX. */}
            <History
              // Обрабатываем конструкцию: aria-hidden.
              aria-hidden="true"
              // Обрабатываем конструкцию: className.
              className="text-text-tertiary size-3.5"
              // Продолжаем выражение.
            />
            {/* Выводим текстовое содержимое в JSX. */}
            <span className="text-text-primary font-mono">
              {/* Выводим текстовое содержимое в JSX. */}
              {new Date(backup.timestamp).toLocaleString("ru-RU")}
              {/* Выводим текстовое содержимое в JSX. */}
            </span>
            {/* Выводим текстовое содержимое в JSX. */}
            <span className="text-text-tertiary">
              {/* Выводим текстовое содержимое в JSX. */}
              {formatVersion(backup.version)} · {formatBytes(backup.size)}
              {/* Выводим текстовое содержимое в JSX. */}
            </span>
            {/* Выводим текстовое содержимое в JSX. */}
          </span>
          {/* — разделитель логических блоков — */}

          {/* Выводим текстовое содержимое в JSX. */}
          <Button
            // Обрабатываем конструкцию: size.
            size="sm"
            // Обрабатываем конструкцию: variant.
            variant="secondary"
            // Обрабатываем конструкцию: disabled.
            disabled={isBusy}
            // Обрабатываем конструкцию: onClick.
            onClick={() => {
              // Обрабатываем конструкцию: setIsBusy.
              setIsBusy(true);
              // Обрабатываем конструкцию: void rollback(backup.path).finally(() => { setIsBusy(fa….
              void rollback(backup.path).finally(() => {
                // Обрабатываем конструкцию: setIsBusy.
                setIsBusy(false);
                // Обрабатываем конструкцию: refresh.
                refresh();
                // Закрываем текущий блок.
              });
              // Закрываем текущий блок.
            }}
            // Обрабатываем конструкцию: icon.
            icon={<RotateCcw aria-hidden="true" className="size-3.5" />}
            // Продолжаем выражение.
          >
            {/* Выводим текстовое содержимое в JSX. */}
            {t("updates.revert")}
            {/* Выводим текстовое содержимое в JSX. */}
          </Button>
          {/* Выводим текстовое содержимое в JSX. */}
        </div>
        // Закрываем выражение или список аргументов.
      ))}
      {/* Выводим текстовое содержимое в JSX. */}
    </div>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export default BackupHistory;.
export default BackupHistory;
// — разделитель логических блоков —
