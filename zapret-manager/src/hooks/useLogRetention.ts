import { useEffect, useRef } from "react";

import { useI18n } from "@/i18n";
import { pruneLogs } from "@/hooks/useSystemInfo";
import { toErrorMessage } from "@/lib/utils";
import { useLogsStore } from "@/stores/useLogsStore";
import { useSettingsStore } from "@/stores/useSettingsStore";

/**
 * Применяет срок хранения журналов.
 *
 * Раньше значение только записывалось в настройки: файлы `security.log` и логи
 * запусков лежали на диске, пока их не съедал сброс или переустановка. Теперь
 * при старте приложения и при каждом изменении настройки старые файлы удаляются,
 * а результат попадает в журнал — иначе пользователь не понимает, что настройка
 * вообще что-то делает.
 */
export function useLogRetention(): void {
  const { t } = useI18n();
  const retentionDays = useSettingsStore(
    (state) => state.settings.advanced.logRetentionDays
  );
  const addLog = useLogsStore((state) => state.addLog);
  const applied = useRef(false);

  useEffect(() => {
    let cancelled = false;

    void pruneLogs(retentionDays)
      .then((removed) => {
        if (cancelled || removed === 0) {
          return;
        }

        addLog({
          level: "info",
          source: "system",
          message: t("settings.advanced.logRetentionPruned", {
            count: removed,
            days: retentionDays,
          }),
        });
      })
      .catch((caught: unknown) => {
        if (cancelled || applied.current) {
          return;
        }

        applied.current = true;

        addLog({
          level: "error",
          source: "system",
          message: t("settings.advanced.logRetentionFailed", {
            error: toErrorMessage(caught),
          }),
        });
      });

    return () => {
      cancelled = true;
    };
  }, [addLog, retentionDays, t]);
}
