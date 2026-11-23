// Импортируем зависимости из модуля react.
import { useState, type KeyboardEvent } from "react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/i18n.
import { useI18n } from "@/i18n";
// Импортируем зависимости из модуля @/lib/settingsSchema.
import {
  // Подключаем именованный импорт MAX_LOG_RETENTION_DAYS.
  MAX_LOG_RETENTION_DAYS,
  // Подключаем именованный импорт MIN_LOG_RETENTION_DAYS.
  MIN_LOG_RETENTION_DAYS,
  // Закрываем текущий блок.
} from "@/lib/settingsSchema";
// Импортируем зависимости из модуля @/lib/utils.
import { cn } from "@/lib/utils";
// Импортируем зависимости из модуля @/stores/useSettingsStore.
import { useSettingsStore } from "@/stores/useSettingsStore";
// — разделитель логических блоков —

// Сохраняем пояснение разработчика:
/**
 // Сохраняем пояснение разработчика: * Ширина поля считается от количества цифр в поле.
 * Ширина поля считается от количества цифр в поле.
 // Сохраняем пояснение разработчика: *
 *
 // Сохраняем пояснение разработчика: * Пользователь просил поле «поменьше» и чтобы оно само растя…
 * Пользователь просил поле «поменьше» и чтобы оно само растягивалось, если
 // Сохраняем пояснение разработчика: * цифр больше. Ширина цифры в ch намеренно не используется: …
 * цифр больше. Ширина цифры в `ch` намеренно не используется: `ch` — это ширина
 // Сохраняем пояснение разработчика: * «0» в текущем шрифте, а tabular-nums чуть шире, и поле обр…
 * «0» в текущем шрифте, а `tabular-nums` чуть шире, и поле обрезает значение.
 // Сохраняем пояснение разработчика: * Поэтому берём прикидку ширины моноширинной цифры в em — он…
 * Поэтому берём прикидку ширины моноширинной цифры в `em` — она не зависит ни
 // Сохраняем пояснение разработчика: * от масштаба интерфейса, ни от шрифта.
 * от масштаба интерфейса, ни от шрифта.
 // Сохраняем пояснение разработчика: 
 */
// Обрабатываем конструкцию: const MIN_DIGITS = 2.
const MIN_DIGITS = 2;
// Обрабатываем конструкцию: const MAX_DIGITS = 4.
const MAX_DIGITS = 4;
// Сохраняем пояснение разработчика:
/**
 // Сохраняем пояснение разработчика: * Ширина tabular-цифры Inter ≈ 0.63em — берём с небольшим за…
 * Ширина tabular-цифры Inter ≈ 0.63em — берём с небольшим запасом.
 // Сохраняем пояснение разработчика: * Считается в кегле самого поля, поэтому контейнер ниже обяз…
 * Считается в кегле самого поля, поэтому контейнер ниже обязан нести
 // Сохраняем пояснение разработчика: * тот же text-xs, что и инпут.
 * тот же `text-xs`, что и инпут.
 // Сохраняем пояснение разработчика: 
 */
// Обрабатываем конструкцию: const DIGIT_WIDTH_EM = 0.66.
const DIGIT_WIDTH_EM = 0.66;
// Сохраняем пояснение разработчика: Отступы px-1.5, рамка и запас под каретку/антиалиасинг цифр.
/** Отступы `px-1.5`, рамка и запас под каретку/антиалиасинг цифр. */
// Обрабатываем конструкцию: const FIELD_CHROME_EM = 1.3.
const FIELD_CHROME_EM = 1.3;
// — разделитель логических блоков —

// Сохраняем пояснение разработчика:
/**
 // Сохраняем пояснение разработчика: * Поле «хранить логи N дней».
 * Поле «хранить логи N дней».
 // Сохраняем пояснение разработчика: *
 *
 // Сохраняем пояснение разработчика: * Раньше значение писалось в стор на каждый символ, из-за че…
 * Раньше значение писалось в стор на каждый символ, из-за чего: поле нельзя
 // Сохраняем пояснение разработчика: * было очистить (пустая строка тут же превращалась в минимум…
 * было очистить (пустая строка тут же превращалась в минимум и каретка
 // Сохраняем пояснение разработчика: * прыгала), можно было ввести 0 вопреки схеме, а лишние цифр…
 * прыгала), можно было ввести 0 вопреки схеме, а лишние цифры проглатывались
 // Сохраняем пояснение разработчика: * по ходу набора. Теперь есть локальный черновик: во время в…
 * по ходу набора. Теперь есть локальный черновик: во время ввода текст
 // Сохраняем пояснение разработчика: * принадлежит полю, а нормализация и запись происходят по bl…
 * принадлежит полю, а нормализация и запись происходят по blur или Enter.
 // Сохраняем пояснение разработчика: 
 */
// Объявляем функцию LogRetentionField.
function LogRetentionField() {
  // Обрабатываем конструкцию: const { t } = useI18n().
  const { t } = useI18n();
  // Обрабатываем конструкцию: const logRetentionDays = useSettingsStore( (state) => s….
  const logRetentionDays = useSettingsStore(
    // Объявляем функцию-обработчик или стрелочную функцию.
    (state) => state.settings.advanced.logRetentionDays
    // Закрываем выражение или список аргументов.
  );
  // Обрабатываем конструкцию: const updateAdvanced = useSettingsStore((state) => stat….
  const updateAdvanced = useSettingsStore((state) => state.updateAdvanced);
  // Обрабатываем конструкцию: const [draft, setDraft] = useState(String(logRetentionD….
  const [draft, setDraft] = useState(String(logRetentionDays));
  // Обрабатываем конструкцию: const [lastStored, setLastStored] = useState(logRetenti….
  const [lastStored, setLastStored] = useState(logRetentionDays);
  // — разделитель логических блоков —

  // Сохраняем пояснение разработчика: // значение из стора меняется снаружи (импорт настроек, сбро…
  // значение из стора меняется снаружи (импорт настроек, сброс раздела) —
  // Сохраняем пояснение разработчика: // подхватываем его во время рендера, без эффекта с лишним р…
  // подхватываем его во время рендера, без эффекта с лишним ререндером
  // Проверяем бизнес-условие: logRetentionDays !== lastStored.
  if (logRetentionDays !== lastStored) {
    // Обрабатываем конструкцию: setLastStored.
    setLastStored(logRetentionDays);
    // Обрабатываем конструкцию: setDraft.
    setDraft(String(logRetentionDays));
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const commit = (): void => { const digits = draft.repla….
  const commit = (): void => {
    // Обрабатываем конструкцию: const digits = draft.replace(/\D/g, ).
    const digits = draft.replace(/\D/g, "");
    // Обрабатываем конструкцию: const parsed = digits === ? MIN_LOG_RETENTION_DAYS : Nu….
    const parsed = digits === "" ? MIN_LOG_RETENTION_DAYS : Number(digits);
    // Обрабатываем конструкцию: const clamped = Math.min( Math.max(parsed, MIN_LOG_RETE….
    const clamped = Math.min(
      // Обрабатываем конструкцию: Math.
      Math.max(parsed, MIN_LOG_RETENTION_DAYS),
      // Обрабатываем конструкцию: MAX_LOG_RETENTION_DAYS.
      MAX_LOG_RETENTION_DAYS
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: setDraft.
    setDraft(String(clamped));
    // — разделитель логических блоков —

    // Проверяем бизнес-условие: clamped !== logRetentionDays.
    if (clamped !== logRetentionDays) {
      // Обрабатываем конструкцию: updateAdvanced.
      updateAdvanced({ logRetentionDays: clamped });
      // Закрываем текущий блок.
    }
    // Закрываем текущий блок.
  };
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const handleKeyDown = (event: KeyboardEvent<HTMLInputEl….
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    // Проверяем бизнес-условие: event.key === Enter.
    if (event.key === "Enter") {
      // Обрабатываем конструкцию: event.
      event.preventDefault();
      // Обрабатываем конструкцию: commit.
      commit();
      // Обрабатываем конструкцию: event.
      event.currentTarget.blur();
      // Завершаем функцию без возвращаемого значения.
      return;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Сохраняем пояснение разработчика: // Escape возвращает последнее сохранённое значение и не тро…
    // Escape возвращает последнее сохранённое значение и не трогает стор
    // Проверяем бизнес-условие: event.key === Escape.
    if (event.key === "Escape") {
      // Обрабатываем конструкцию: event.
      event.preventDefault();
      // Обрабатываем конструкцию: setDraft.
      setDraft(String(logRetentionDays));
      // Обрабатываем конструкцию: event.
      event.currentTarget.blur();
      // Закрываем текущий блок.
    }
    // Закрываем текущий блок.
  };
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const digits = Math.min(Math.max(draft.length, MIN_DIGI….
  const digits = Math.min(Math.max(draft.length, MIN_DIGITS), MAX_DIGITS);
  // Сохраняем пояснение разработчика: // ширину задаём контейнеру, а не самому <input>: внутри цеп…
  // ширину задаём контейнеру, а не самому <input>: внутри цепочки
  // Сохраняем пояснение разработчика: // shrink-to-fit flex-контейнеров инпуту не удаётся расширит…
  // shrink-to-fit flex-контейнеров инпуту не удаётся расшириться от inline-стиля
  // Обрабатываем конструкцию: const widthEm = ${(digits * DIGIT_WIDTH_EM + FIELD_CHRO….
  const widthEm = `${(digits * DIGIT_WIDTH_EM + FIELD_CHROME_EM).toFixed(2)}em`;
  // — разделитель логических блоков —

  // Возвращаем результат: ( <div className=flex items-center gap-2> <div style={{….
  return (
    // Обрабатываем конструкцию: <div className=flex items-center gap-2>.
    <div className="flex items-center gap-2">
      {/* Выводим текстовое содержимое в JSX. */}
      <div
        // Обрабатываем конструкцию: style.
        style={{ width: widthEm }}
        // Обрабатываем конструкцию: className.
        className={cn(
          // Обрабатываем конструкцию: bg-glass-bg border-glass-border focus-within:border-acc….
          "bg-glass-bg border-glass-border focus-within:border-accent-primary",
          // Обрабатываем конструкцию: box-border flex h-8 shrink-0 items-center rounded-lg bo….
          "box-border flex h-8 shrink-0 items-center rounded-lg border px-1.5 text-xs",
          // Обрабатываем конструкцию: transition-colors duration-200 ease-out.
          "transition-colors duration-200 ease-out"
          // Закрываем выражение или список аргументов.
        )}
        // Продолжаем выражение.
      >
        {/* Выводим текстовое содержимое в JSX. */}
        <input
          // Обрабатываем конструкцию: type.
          type="text"
          // Обрабатываем конструкцию: inputMode.
          inputMode="numeric"
          // Обрабатываем конструкцию: autoComplete.
          autoComplete="off"
          // Обрабатываем конструкцию: spellCheck.
          spellCheck={false}
          // Обрабатываем конструкцию: maxLength.
          maxLength={MAX_DIGITS}
          // Сохраняем пояснение разработчика: // фокус показывает рамка контейнера (focus-within), иначе п…
          // фокус показывает рамка контейнера (focus-within), иначе поле
          // Сохраняем пояснение разработчика: // оказывается обведено двумя кольцами
          // оказывается обведено двумя кольцами
          // Задаём атрибут data-focus-quiet элемента.
          data-focus-quiet
          // Обрабатываем конструкцию: aria-label.
          aria-label={t("settings.advanced.logRetention")}
          // Обрабатываем конструкцию: value.
          value={draft}
          // Обрабатываем конструкцию: onChange.
          onChange={(event) => {
            // Обрабатываем конструкцию: setDraft.
            setDraft(event.target.value.replace(/\D/g, ""));
            // Закрываем текущий блок.
          }}
          // Обрабатываем конструкцию: onFocus.
          onFocus={(event) => {
            // Обрабатываем конструкцию: event.
            event.currentTarget.select();
            // Закрываем текущий блок.
          }}
          // Обрабатываем конструкцию: onBlur.
          onBlur={commit}
          // Обрабатываем конструкцию: onKeyDown.
          onKeyDown={handleKeyDown}
          // Обрабатываем конструкцию: className.
          className="text-text-primary w-full bg-transparent text-center text-xs tabular-nums outline-none"
          // Продолжаем выражение.
        />
        {/* Выводим текстовое содержимое в JSX. */}
      </div>
      {/* Выводим текстовое содержимое в JSX. */}
      <span className="text-text-tertiary text-xs">
        {/* Выводим текстовое содержимое в JSX. */}
        {t("settings.advanced.logRetentionUnit")}
        {/* Выводим текстовое содержимое в JSX. */}
      </span>
      {/* Выводим текстовое содержимое в JSX. */}
    </div>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export default LogRetentionField;.
export default LogRetentionField;
// — разделитель логических блоков —
