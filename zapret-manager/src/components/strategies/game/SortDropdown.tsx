// Импортируем зависимости из модуля @/components/ui.
import { Dropdown } from "@/components/ui";
// Импортируем зависимости из модуля @/components/ui.
import type { DropdownOption } from "@/components/ui";
// Импортируем зависимости из модуля @/i18n.
import { useI18n } from "@/i18n";
// Импортируем зависимости из модуля @/i18n/types.
import type { TranslationKey } from "@/i18n/types";
// Импортируем зависимости из модуля @/types.
import type { SortMode } from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface SortDropdownProps {
  // Обрабатываем конструкцию: value.
  value: SortMode;
  // Обрабатываем конструкцию: onChange.
  onChange: (value: SortMode) => void;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: const OPTIONS = [ { value: rating, labelKey: strategies….
const OPTIONS = [
  // Открываем объектный литерал.
  { value: "rating", labelKey: "strategies.sort.rating" },
  // Открываем объектный литерал.
  { value: "name", labelKey: "strategies.sort.name" },
  // Открываем объектный литерал.
  { value: "date", labelKey: "strategies.sort.date" },
  // Закрываем массив или список.
] as const satisfies readonly { value: SortMode; labelKey: TranslationKey }[];
// — разделитель логических блоков —

// Сохраняем пояснение разработчика:
/**
 // Сохраняем пояснение разработчика: * Сортировка карточек стратегий.
 * Сортировка карточек стратегий.
 // Сохраняем пояснение разработчика: *
 *
 // Сохраняем пояснение разработчика: * Раньше здесь был собственный попап, позиционированный abso…
 * Раньше здесь был собственный попап, позиционированный `absolute`: панель
 // Сохраняем пояснение разработчика: * перекрывалась соседними блоками, уезжала за границы прокру…
 * перекрывалась соседними блоками, уезжала за границы прокручиваемой области
 // Сохраняем пояснение разработчика: * и обрезала пункты посреди слова. Теперь рисуется общий Dro…
 * и обрезала пункты посреди слова. Теперь рисуется общий Dropdown на портале,
 // Сохраняем пояснение разработчика: * который сам разворачивается вверх/вниз и не обрезается кон…
 * который сам разворачивается вверх/вниз и не обрезается контейнерами.
 // Сохраняем пояснение разработчика: 
 */
// Объявляем функцию SortDropdown.
function SortDropdown({ value, onChange }: SortDropdownProps) {
  // Обрабатываем конструкцию: const { t } = useI18n().
  const { t } = useI18n();
  // Обрабатываем конструкцию: const options: readonly DropdownOption<SortMode>[] = OP….
  const options: readonly DropdownOption<SortMode>[] = OPTIONS.map(
    // Объявляем функцию-обработчик или стрелочную функцию.
    (option) => ({
      // Обрабатываем конструкцию: value.
      value: option.value,
      // Обрабатываем конструкцию: label.
      label: t(option.labelKey),
      // Закрываем текущий блок.
    })
    // Закрываем выражение или список аргументов.
  );
  // — разделитель логических блоков —

  // Возвращаем результат: ( <Dropdown label={t(strategies.sort.title)} value={val….
  return (
    // Рендерим самозакрывающийся элемент Dropdown.
    <Dropdown
      // Обрабатываем конструкцию: label.
      label={t("strategies.sort.title")}
      // Обрабатываем конструкцию: value.
      value={value}
      // Обрабатываем конструкцию: options.
      options={options}
      // Обрабатываем конструкцию: onChange.
      onChange={onChange}
      // Продолжаем выражение.
    />
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export default SortDropdown;.
export default SortDropdown;
// — разделитель логических блоков —
