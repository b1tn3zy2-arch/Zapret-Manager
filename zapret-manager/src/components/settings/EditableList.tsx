// Импортируем зависимости из модуля react.
import { useState } from "react";
// Импортируем зависимости из модуля lucide-react.
import { CircleHelp, Plus, Trash2 } from "lucide-react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/components/ui.
import { Button, Input, Text, Tooltip } from "@/components/ui";
// Импортируем зависимости из модуля @/lib/utils.
import { cn } from "@/lib/utils";
// Импортируем зависимости из модуля @/i18n.
import { useI18n } from "@/i18n";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface EditableListProps {
  // Обрабатываем конструкцию: items.
  items: string[];
  // Обрабатываем конструкцию: onChange.
  onChange: (items: string[]) => void;
  // Обрабатываем конструкцию: label.
  label: string;
  // Обрабатываем конструкцию: placeholder.
  placeholder: string;
  // Обрабатываем конструкцию: addLabel.
  addLabel: string;
  // Обрабатываем конструкцию: emptyMessage.
  emptyMessage: string;
  // Обрабатываем конструкцию: validate.
  validate?: ((value: string) => string | null) | undefined;
  // Сохраняем пояснение разработчика: Пояснение к полю: показывается в подсказке, а не строкой под…
  /** Пояснение к полю: показывается в подсказке, а не строкой под полем */
  // Обрабатываем конструкцию: hint.
  hint?: string;
  // Обрабатываем конструкцию: type.
  type?: "text" | "number";
  // Обрабатываем конструкцию: disabled.
  disabled?: boolean;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем интерфейс RowProps с контрактом данных.
interface RowProps {
  // Обрабатываем конструкцию: value.
  value: string;
  // Обрабатываем конструкцию: index.
  index: number;
  // Обрабатываем конструкцию: total.
  total: number;
  // Обрабатываем конструкцию: onChange.
  onChange: (value: string) => void;
  // Обрабатываем конструкцию: onRemove.
  onRemove: () => void;
  // Обрабатываем конструкцию: validate.
  validate: ((value: string) => string | null) | undefined;
  // Обрабатываем конструкцию: disabled.
  disabled: boolean;
  // Обрабатываем конструкцию: type.
  type: "text" | "number";
  // Обрабатываем конструкцию: placeholder.
  placeholder: string;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию EditableRow.
function EditableRow({
  // Обрабатываем конструкцию: value.
  value,
  // Обрабатываем конструкцию: index.
  index,
  // Обрабатываем конструкцию: total.
  total,
  // Обрабатываем конструкцию: onChange.
  onChange,
  // Обрабатываем конструкцию: onRemove.
  onRemove,
  // Обрабатываем конструкцию: validate.
  validate,
  // Обрабатываем конструкцию: disabled.
  disabled,
  // Обрабатываем конструкцию: type.
  type,
  // Обрабатываем конструкцию: placeholder.
  placeholder,
  // Закрываем текущий блок.
}: RowProps) {
  // Обрабатываем конструкцию: const { t } = useI18n().
  const { t } = useI18n();
  // Обрабатываем конструкцию: const [error, setError] = useState<string | null>(null).
  const [error, setError] = useState<string | null>(null);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const handleChange = (next: string): void => { onChange….
  const handleChange = (next: string): void => {
    // Обрабатываем конструкцию: onChange.
    onChange(next);
    // Обрабатываем конструкцию: setError.
    setError(validate === undefined ? null : validate(next));
    // Закрываем текущий блок.
  };
  // — разделитель логических блоков —

  // Возвращаем результат: ( <div className=flex items-start gap-2> <Input variant….
  return (
    // Обрабатываем конструкцию: <div className=flex items-start gap-2>.
    <div className="flex items-start gap-2">
      {/* Выводим текстовое содержимое в JSX. */}
      <Input
        // Обрабатываем конструкцию: variant.
        variant="filled"
        // Обрабатываем конструкцию: size.
        size="sm"
        // Обрабатываем конструкцию: type.
        type={type}
        // Обрабатываем конструкцию: value.
        value={value}
        // Обрабатываем конструкцию: disabled.
        disabled={disabled}
        // Обрабатываем конструкцию: placeholder.
        placeholder={placeholder}
        // Обрабатываем конструкцию: error.
        error={error !== null}
        // Обрабатываем конструкцию: errorMessage.
        errorMessage={error ?? undefined}
        // Обрабатываем конструкцию: aria-label.
        aria-label={t("settings.common.itemAria", { index: index + 1, total })}
        // Обрабатываем конструкцию: onChange.
        onChange={(event) => {
          // Обрабатываем конструкцию: handleChange.
          handleChange(event.target.value);
          // Закрываем текущий блок.
        }}
        // Продолжаем выражение.
      />
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <Button
        // Обрабатываем конструкцию: size.
        size="icon"
        // Обрабатываем конструкцию: variant.
        variant="ghost"
        // Обрабатываем конструкцию: disabled.
        disabled={disabled}
        // Обрабатываем конструкцию: aria-label.
        aria-label={t("settings.common.deleteItemAria", { index: index + 1 })}
        // Обрабатываем конструкцию: title.
        title={t("settings.common.deleteItemTitle")}
        // Обрабатываем конструкцию: onClick.
        onClick={onRemove}
        // Обрабатываем конструкцию: icon.
        icon={<Trash2 className="size-4" />}
        // Продолжаем выражение.
      />
      {/* Выводим текстовое содержимое в JSX. */}
    </div>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию EditableList.
function EditableList({
  // Обрабатываем конструкцию: items.
  items,
  // Обрабатываем конструкцию: onChange.
  onChange,
  // Обрабатываем конструкцию: label.
  label,
  // Обрабатываем конструкцию: placeholder.
  placeholder,
  // Обрабатываем конструкцию: addLabel.
  addLabel,
  // Обрабатываем конструкцию: emptyMessage.
  emptyMessage,
  // Обрабатываем конструкцию: validate.
  validate,
  // Обрабатываем конструкцию: hint.
  hint,
  // Обрабатываем конструкцию: type.
  type = "text",
  // Обрабатываем конструкцию: disabled.
  disabled = false,
  // Закрываем текущий блок.
}: EditableListProps) {
  // Обрабатываем конструкцию: const { t } = useI18n().
  const { t } = useI18n();
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const update = (index: number, value: string): void => ….
  const update = (index: number, value: string): void => {
    // Обрабатываем конструкцию: onChange.
    onChange(
      // Обрабатываем конструкцию: items.
      items.map((item, position) => (position === index ? value : item))
      // Закрываем выражение или список аргументов.
    );
    // Закрываем текущий блок.
  };
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const remove = (index: number): void => { onChange(item….
  const remove = (index: number): void => {
    // Обрабатываем конструкцию: onChange.
    onChange(items.filter((_, position) => position !== index));
    // Закрываем текущий блок.
  };
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const add = (): void => { onChange([...items, ]); }.
  const add = (): void => {
    // Обрабатываем конструкцию: onChange.
    onChange([...items, ""]);
    // Закрываем текущий блок.
  };
  // — разделитель логических блоков —

  // Возвращаем результат: ( <fieldset className=flex flex-col gap-2 disabled={dis….
  return (
    // Обрабатываем конструкцию: <fieldset className=flex flex-col gap-2 disabled={disab….
    <fieldset className="flex flex-col gap-2" disabled={disabled}>
      {/* Выводим текстовое содержимое в JSX. */}
      <legend className="mb-1 flex items-center gap-1.5">
        {/* Выводим текстовое содержимое в JSX. */}
        <span className="text-text-secondary text-xs font-medium tracking-wide uppercase">
          {/* Выводим текстовое содержимое в JSX. */}
          {label}
          {/* Выводим текстовое содержимое в JSX. */}
        </span>
        {/* Выводим текстовое содержимое в JSX. */}
        {hint === undefined ? null : (
          // Обрабатываем конструкцию: <Tooltip content={hint}>.
          <Tooltip content={hint}>
            {/* Выводим текстовое содержимое в JSX. */}
            <button
              // Обрабатываем конструкцию: type.
              type="button"
              // Обрабатываем конструкцию: tabIndex.
              tabIndex={0}
              // Обрабатываем конструкцию: aria-label.
              aria-label={t("common.hint")}
              // Обрабатываем конструкцию: className.
              className={cn(
                // Обрабатываем конструкцию: text-text-tertiary hover:text-text-secondary rounded-fu….
                "text-text-tertiary hover:text-text-secondary rounded-full p-0.5",
                // Обрабатываем конструкцию: focus-visible:ring-accent-primary/60 transition-colors.
                "focus-visible:ring-accent-primary/60 transition-colors",
                // Обрабатываем конструкцию: focus-visible:ring-2 focus-visible:outline-none.
                "focus-visible:ring-2 focus-visible:outline-none"
                // Закрываем выражение или список аргументов.
              )}
              // Продолжаем выражение.
            >
              {/* Выводим текстовое содержимое в JSX. */}
              <CircleHelp aria-hidden="true" className="size-3.5" />
              {/* Выводим текстовое содержимое в JSX. */}
            </button>
            {/* Выводим текстовое содержимое в JSX. */}
          </Tooltip>
          // Закрываем выражение или список аргументов.
        )}
        {/* Выводим текстовое содержимое в JSX. */}
      </legend>
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      {items.length === 0 ? (
        // Обрабатываем конструкцию: <Text variant=caption size=sm className=text-text-terti….
        <Text variant="caption" size="sm" className="text-text-tertiary">
          {/* Выводим текстовое содержимое в JSX. */}
          {emptyMessage}
          {/* Выводим текстовое содержимое в JSX. */}
        </Text>
      ) : // Закрываем выражение или список аргументов.
      // Продолжаем предыдущую конструкцию.
      null}
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      {items.map((item, index) => (
        // Рендерим самозакрывающийся элемент EditableRow.
        <EditableRow
          // Обрабатываем конструкцию: key.
          key={index}
          // Обрабатываем конструкцию: value.
          value={item}
          // Обрабатываем конструкцию: index.
          index={index}
          // Обрабатываем конструкцию: total.
          total={items.length}
          // Обрабатываем конструкцию: type.
          type={type}
          // Обрабатываем конструкцию: placeholder.
          placeholder={placeholder}
          // Обрабатываем конструкцию: disabled.
          disabled={disabled}
          // Обрабатываем конструкцию: validate.
          validate={validate}
          // Обрабатываем конструкцию: onChange.
          onChange={(next) => {
            // Обрабатываем конструкцию: update.
            update(index, next);
            // Закрываем текущий блок.
          }}
          // Обрабатываем конструкцию: onRemove.
          onRemove={() => {
            // Обрабатываем конструкцию: remove.
            remove(index);
            // Закрываем текущий блок.
          }}
          // Продолжаем выражение.
        />
        // Закрываем выражение или список аргументов.
      ))}
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <div>
        {/* Выводим текстовое содержимое в JSX. */}
        <Button
          // Обрабатываем конструкцию: size.
          size="sm"
          // Обрабатываем конструкцию: variant.
          variant="secondary"
          // Обрабатываем конструкцию: disabled.
          disabled={disabled}
          // Обрабатываем конструкцию: onClick.
          onClick={add}
          // Обрабатываем конструкцию: icon.
          icon={
            // Рендерим самозакрывающийся элемент Plus.
            <Plus aria-hidden="true" className="size-3.5" strokeWidth={2} />
            // Закрываем текущий блок.
          }
          // Продолжаем выражение.
        >
          {/* Выводим текстовое содержимое в JSX. */}
          {addLabel}
          {/* Выводим текстовое содержимое в JSX. */}
        </Button>
        {/* Выводим текстовое содержимое в JSX. */}
      </div>
      {/* Выводим текстовое содержимое в JSX. */}
    </fieldset>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export default EditableList;.
export default EditableList;
// — разделитель логических блоков —
