import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { Button, Input, Text } from "@/components/ui";

export interface EditableListProps {
  items: string[];
  onChange: (items: string[]) => void;
  label: string;
  placeholder: string;
  addLabel: string;
  emptyMessage: string;
  validate?: ((value: string) => string | null) | undefined;
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
        aria-label={`Элемент ${index + 1} из ${total}`}
        onChange={(event) => {
          handleChange(event.target.value);
        }}
      />

      <Button
        size="icon"
        variant="ghost"
        disabled={disabled}
        aria-label={`Удалить элемент ${index + 1}`}
        title="Удалить"
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
  type = "text",
  disabled = false,
}: EditableListProps) {
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
      <legend className="text-text-secondary mb-1 text-xs font-medium tracking-wide uppercase">
        {label}
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
