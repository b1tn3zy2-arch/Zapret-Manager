// Импортируем зависимости из модуля @/lib/settingsConstants.
import {
  // Подключаем именованный импорт SETTINGS_SECTION_ICONS.
  SETTINGS_SECTION_ICONS,
  // Подключаем именованный импорт SETTINGS_SECTIONS.
  SETTINGS_SECTIONS,
  // Закрываем текущий блок.
} from "@/lib/settingsConstants";
// Импортируем зависимости из модуля @/lib/utils.
import { cn } from "@/lib/utils";
// Импортируем зависимости из модуля @/types.
import type { SettingsSection } from "@/types";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/i18n.
import type { Translate } from "@/i18n";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface SettingsNavProps {
  // Обрабатываем конструкцию: active.
  active: SettingsSection;
  // Обрабатываем конструкцию: onChange.
  onChange: (section: SettingsSection) => void;
  // Обрабатываем конструкцию: t.
  t: Translate;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию SettingsNav.
function SettingsNav({ active, onChange, t }: SettingsNavProps) {
  // Возвращаем результат: ( <nav aria-label={t(settings.sections.general)} classN….
  return (
    // Обрабатываем конструкцию: <nav aria-label={t(settings.sections.general)} classNam….
    <nav
      // Обрабатываем конструкцию: aria-label.
      aria-label={t("settings.sections.general")}
      // Обрабатываем конструкцию: className.
      className={cn(
        // Обрабатываем конструкцию: flex gap-1 md:sticky md:top-0 md:flex-col.
        "flex gap-1 md:sticky md:top-0 md:flex-col",
        // Обрабатываем конструкцию: md:w-52 md:shrink-0.
        "md:w-52 md:shrink-0",
        // Обрабатываем конструкцию: -mx-1 scrollbar-none flex-row overflow-x-auto px-1 pb-2.
        "-mx-1 scrollbar-none flex-row overflow-x-auto px-1 pb-2"
        // Закрываем выражение или список аргументов.
      )}
      // Продолжаем выражение.
    >
      {/* Выводим текстовое содержимое в JSX. */}
      {SETTINGS_SECTIONS.map((section) => {
        // Обрабатываем конструкцию: const Icon = SETTINGS_SECTION_ICONS[section].
        const Icon = SETTINGS_SECTION_ICONS[section];
        // Обрабатываем конструкцию: const selected = section === active.
        const selected = section === active;
        // — разделитель логических блоков —

        // Возвращаем результат: ( <button key={section} type=button aria-current={selec….
        return (
          // Обрабатываем конструкцию: <button key={section} type=button aria-current={selecte….
          <button
            // Обрабатываем конструкцию: key.
            key={section}
            // Обрабатываем конструкцию: type.
            type="button"
            // Обрабатываем конструкцию: aria-current.
            aria-current={selected ? "page" : undefined}
            // Обрабатываем конструкцию: onClick.
            onClick={() => {
              // Обрабатываем конструкцию: onChange.
              onChange(section);
              // Закрываем текущий блок.
            }}
            // Обрабатываем конструкцию: className.
            className={cn(
              // Обрабатываем конструкцию: flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 t….
              "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-left text-sm",
              // Обрабатываем конструкцию: transition-colors duration-200 ease-out.
              "transition-colors duration-200 ease-out",
              // Обрабатываем конструкцию: selected.
              selected
                ? // Обрабатываем конструкцию: ?.
                  // Продолжаем предыдущую конструкцию.
                  "text-text-primary bg-glass-hover"
                : // Обрабатываем конструкцию: :.
                  // Продолжаем предыдущую конструкцию.
                  "text-text-secondary hover:text-text-primary hover:bg-glass-hover"
              // Закрываем выражение или список аргументов.
            )}
            // Продолжаем выражение.
          >
            {/* Выводим текстовое содержимое в JSX. */}
            <Icon
              // Обрабатываем конструкцию: aria-hidden.
              aria-hidden="true"
              // Обрабатываем конструкцию: className.
              className={cn(
                // Обрабатываем конструкцию: size-4 shrink-0.
                "size-4 shrink-0",
                // Обрабатываем конструкцию: selected.
                selected && "text-accent-primary"
                // Закрываем выражение или список аргументов.
              )}
              // Обрабатываем конструкцию: strokeWidth.
              strokeWidth={2}
              // Продолжаем выражение.
            />
            {/* Выводим текстовое содержимое в JSX. */}
            <span className="whitespace-nowrap">
              {/* Выводим текстовое содержимое в JSX. */}
              {t(`settings.sections.${section}`)}
              {/* Выводим текстовое содержимое в JSX. */}
            </span>
            {/* Выводим текстовое содержимое в JSX. */}
          </button>
          // Закрываем выражение или список аргументов.
        );
        // Закрываем текущий блок.
      })}
      {/* Выводим текстовое содержимое в JSX. */}
    </nav>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export default SettingsNav;.
export default SettingsNav;
// — разделитель логических блоков —
