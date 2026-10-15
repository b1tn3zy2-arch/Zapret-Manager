import { useState } from "react";

import { Input } from "@/components/ui";
import { useI18n } from "@/i18n";
import {
  MAX_LOG_RETENTION_DAYS,
  MIN_LOG_RETENTION_DAYS,
} from "@/lib/settingsSchema";
import { useSettingsStore } from "@/stores/useSettingsStore";

/**
 * Поле «хранить логи N дней».
 *
 * Раньше значение писалось в стор на каждый символ, из-за чего: поле нельзя
 * было очистить (пустая строка тут же превращалась в минимум и каретка
 * прыгала), можно было ввести 0 вопреки схеме, а лишние цифры проглатывались
 * по ходу набора. Теперь есть локальный черновик: во время ввода текст
 * принадлежит полю, а нормализация и запись происходят по blur или Enter.
 */
function LogRetentionField() {
  const { t } = useI18n();
  const logRetentionDays = useSettingsStore(
    (state) => state.settings.advanced.logRetentionDays
  );
  const updateAdvanced = useSettingsStore((state) => state.updateAdvanced);
  const [draft, setDraft] = useState(String(logRetentionDays));
  const [lastStored, setLastStored] = useState(logRetentionDays);

  // значение из стора меняется снаружи (импорт настроек, сброс раздела) —
  // подхватываем его во время рендера, без эффекта с лишним ререндером
  if (logRetentionDays !== lastStored) {
    setLastStored(logRetentionDays);
    setDraft(String(logRetentionDays));
  }

  const commit = (): void => {
    const digits = draft.replace(/\D/g, "");
    const parsed = digits === "" ? MIN_LOG_RETENTION_DAYS : Number(digits);
    const clamped = Math.min(
      Math.max(parsed, MIN_LOG_RETENTION_DAYS),
      MAX_LOG_RETENTION_DAYS
    );

    setDraft(String(clamped));

    if (clamped !== logRetentionDays) {
      updateAdvanced({ logRetentionDays: clamped });
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Input
        variant="filled"
        size="sm"
        inputMode="numeric"
        maxLength={4}
        value={draft}
        aria-label={t("settings.advanced.logRetention")}
        // ширина по содержимому: поле не прыгает и не болтается впустую
        className="w-16 text-center tabular-nums"
        onChange={(event) => {
          setDraft(event.target.value.replace(/\D/g, ""));
        }}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            commit();
          }
        }}
      />
      <span className="text-text-tertiary text-xs">
        {t("settings.advanced.logRetentionUnit")}
      </span>
    </div>
  );
}

export default LogRetentionField;
