import { useState } from "react";
import { CircleHelp, Plus, Trash2 } from "lucide-react";

import { Button, Input, Text, Tooltip } from "@/components/ui";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n";

export interface EditableListProps {
  items: string[];
  onChange: (items: string[]) => void;
  label: string;
  placeholder: string;
  addLabel: string;
  emptyMessage: string;
  validate?: ((value: string) => string | null) | undefined;
  /** Пояснение к полю: показывается в подсказке, а не строкой под полем */
  hint?: string;
  type?: "text" | "number";
  disabled?: boolean;
}

interface RowProps {
  value: string;
  index: number;
  total: number;
  onChange: (value: string) => void;
  onRemove: () => void;
  validate: ((value: string) => string | null) | undefined;
  disabled: boolean;
  type: "text" | "number";
  placeholder: string;
}

function EditableRow({
  value,
  index,
  total,
  onChange,
  onRemove,
  validate,
  disabled,
  type,
  placeholder,
}: RowProps) {
  const { t } = useI18n();
  const [error, setError] = useState<string | null>(null);

  const handleChange = (next: string): void => {
    onChange(next);
    setError(validate === undefined ? null : validate(next));
  };

  return (
    <div className="flex items-start gap-2">
      <Input
        variant="filled"
        size="sm"
        type={type}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        error={error !== null}
        errorMessage={error ?? undefined}
        aria-label={t("settings.common.itemAria", { index: index + 1, total })}
        onChange={(event) => {
          handleChange(event.target.value);
        }}
      />

      <Button
        size="icon"
        variant="ghost"
        disabled={disabled}
        aria-label={t("settings.common.deleteItemAria", { index: index + 1 })}
        title={t("settings.common.deleteItemTitle")}
        onClick={onRemove}
        icon={<Trash2 className="size-4" />}
      />
    </div>
  );
}

function EditableList({
  items,
  onChange,
  label,
  placeholder,
  addLabel,
  emptyMessage,
  validate,
  hint,
  type = "text",
  disabled = false,
}: EditableListProps) {
  const { t } = useI18n();

  const update = (index: number, value: string): void => {
    onChange(
      items.map((item, position) => (position === index ? value : item))
    );
  };

  const remove = (index: number): void => {
    onChange(items.filter((_, position) => position !== index));
  };

  const add = (): void => {
    onChange([...items, ""]);
  };

  return (
    <fieldset className="flex flex-col gap-2" disabled={disabled}>
      <legend className="mb-1 flex items-center gap-1.5">
        <span className="text-text-secondary text-xs font-medium tracking-wide uppercase">
          {label}
        </span>
        {hint === undefined ? null : (
          <Tooltip content={hint}>
            <button
              type="button"
              tabIndex={0}
              aria-label={t("common.hint")}
              className={cn(
                "text-text-tertiary hover:text-text-secondary rounded-full p-0.5",
                "focus-visible:ring-accent-primary/60 transition-colors",
                "focus-visible:ring-2 focus-visible:outline-none"
              )}
            >
              <CircleHelp aria-hidden="true" className="size-3.5" />
            </button>
          </Tooltip>
        )}
      </legend>

      {items.length === 0 ? (
        <Text variant="caption" size="sm" className="text-text-tertiary">
          {emptyMessage}
        </Text>
      ) : null}

      {items.map((item, index) => (
        <EditableRow
          key={index}
          value={item}
          index={index}
          total={items.length}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          validate={validate}
          onChange={(next) => {
            update(index, next);
          }}
          onRemove={() => {
            remove(index);
          }}
        />
      ))}

      <div>
        <Button
          size="sm"
          variant="secondary"
          disabled={disabled}
          onClick={add}
          icon={
            <Plus aria-hidden="true" className="size-3.5" strokeWidth={2} />
          }
        >
          {addLabel}
        </Button>
      </div>
    </fieldset>
  );
}

export default EditableList;
