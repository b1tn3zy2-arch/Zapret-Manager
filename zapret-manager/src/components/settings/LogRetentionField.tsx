import { useState, type KeyboardEvent } from "react";

import { useI18n } from "@/i18n";
import {
  MAX_LOG_RETENTION_DAYS,
  MIN_LOG_RETENTION_DAYS,
} from "@/lib/settingsSchema";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/stores/useSettingsStore";

/**
 * Ширина поля считается от количества цифр в поле.
 *
 * Пользователь просил поле «поменьше» и чтобы оно само растягивалось, если
 * цифр больше. Ширина цифры в `ch` намеренно не используется: `ch` — это ширина
 * «0» в текущем шрифте, а `tabular-nums` чуть шире, и поле обрезает значение.
 * Поэтому берём прикидку ширины моноширинной цифры в `em` — она не зависит ни
 * от масштаба интерфейса, ни от шрифта.
 */
const MIN_DIGITS = 2;
const MAX_DIGITS = 4;
/**
 * Ширина tabular-цифры Inter ≈ 0.63em — берём с небольшим запасом.
 * Считается в кегле самого поля, поэтому контейнер ниже обязан нести
 * тот же `text-xs`, что и инпут.
 */
const DIGIT_WIDTH_EM = 0.66;
/** Отступы `px-1.5`, рамка и запас под каретку/антиалиасинг цифр. */
const FIELD_CHROME_EM = 1.3;

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

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === "Enter") {
      event.preventDefault();
      commit();
      event.currentTarget.blur();
      return;
    }

    // Escape возвращает последнее сохранённое значение и не трогает стор
    if (event.key === "Escape") {
      event.preventDefault();
      setDraft(String(logRetentionDays));
      event.currentTarget.blur();
    }
  };

  const digits = Math.min(Math.max(draft.length, MIN_DIGITS), MAX_DIGITS);
  // ширину задаём контейнеру, а не самому <input>: внутри цепочки
  // shrink-to-fit flex-контейнеров инпуту не удаётся расшириться от inline-стиля
  const widthEm = `${(digits * DIGIT_WIDTH_EM + FIELD_CHROME_EM).toFixed(2)}em`;

  return (
    <div className="flex items-center gap-2">
      <div
        style={{ width: widthEm }}
        className={cn(
          "bg-glass-bg border-glass-border focus-within:border-accent-primary",
          "box-border flex h-8 shrink-0 items-center rounded-lg border px-1.5 text-xs",
          "transition-colors duration-200 ease-out"
        )}
      >
        <input
          type="text"
          inputMode="numeric"
          autoComplete="off"
          spellCheck={false}
          maxLength={MAX_DIGITS}
          // фокус показывает рамка контейнера (focus-within), иначе поле
          // оказывается обведено двумя кольцами
          data-focus-quiet
          aria-label={t("settings.advanced.logRetention")}
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value.replace(/\D/g, ""));
          }}
          onFocus={(event) => {
            event.currentTarget.select();
          }}
          onBlur={commit}
          onKeyDown={handleKeyDown}
          className="text-text-primary w-full bg-transparent text-center text-xs tabular-nums outline-none"
        />
      </div>
      <span className="text-text-tertiary text-xs">
        {t("settings.advanced.logRetentionUnit")}
      </span>
    </div>
  );
}

export default LogRetentionField;
