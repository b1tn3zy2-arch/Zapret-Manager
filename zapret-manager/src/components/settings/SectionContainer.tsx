// Импортируем зависимости из модуля react.
import type { ReactNode } from "react";
// Импортируем зависимости из модуля lucide-react.
import { RotateCcw } from "lucide-react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/components/ui.
import { Button, Card, Text } from "@/components/ui";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface SectionContainerProps {
  // Обрабатываем конструкцию: title.
  title: string;
  // Обрабатываем конструкцию: description.
  description?: string;
  // Обрабатываем конструкцию: onReset.
  onReset?: (() => void) | undefined;
  // Обрабатываем конструкцию: resetLabel.
  resetLabel?: string;
  // Обрабатываем конструкцию: children.
  children: ReactNode;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию SectionContainer.
function SectionContainer({
  // Обрабатываем конструкцию: title.
  title,
  // Обрабатываем конструкцию: description.
  description,
  // Обрабатываем конструкцию: onReset.
  onReset,
  // Обрабатываем конструкцию: resetLabel.
  resetLabel,
  // Обрабатываем конструкцию: children.
  children,
  // Закрываем текущий блок.
}: SectionContainerProps) {
  // Возвращаем результат: ( <Card className=flex flex-col gap-2 padding=lg> <div ….
  return (
    // Обрабатываем конструкцию: <Card className=flex flex-col gap-2 padding=lg>.
    <Card className="flex flex-col gap-2" padding="lg">
      {/* Выводим текстовое содержимое в JSX. */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        {/* Выводим текстовое содержимое в JSX. */}
        <div className="flex flex-col gap-1">
          {/* Выводим текстовое содержимое в JSX. */}
          <h2 className="text-text-primary text-lg font-semibold">{title}</h2>
          {/* Выводим текстовое содержимое в JSX. */}
          {description !== undefined ? (
            // Обрабатываем конструкцию: <Text variant=body size=sm className=text-text-secondar….
            <Text variant="body" size="sm" className="text-text-secondary">
              {/* Выводим текстовое содержимое в JSX. */}
              {description}
              {/* Выводим текстовое содержимое в JSX. */}
            </Text>
          ) : // Закрываем выражение или список аргументов.
          // Продолжаем предыдущую конструкцию.
          null}
          {/* Выводим текстовое содержимое в JSX. */}
        </div>
        {/* — разделитель логических блоков — */}

        {/* Выводим текстовое содержимое в JSX. */}
        {onReset !== undefined && resetLabel !== undefined ? (
          // Обрабатываем конструкцию: <Button size=sm variant=ghost onClick={onReset} icon={<….
          <Button
            // Обрабатываем конструкцию: size.
            size="sm"
            // Обрабатываем конструкцию: variant.
            variant="ghost"
            // Обрабатываем конструкцию: onClick.
            onClick={onReset}
            // Обрабатываем конструкцию: icon.
            icon={<RotateCcw aria-hidden="true" className="size-3.5" />}
            // Продолжаем выражение.
          >
            {/* Выводим текстовое содержимое в JSX. */}
            {resetLabel}
            {/* Выводим текстовое содержимое в JSX. */}
          </Button>
        ) : // Закрываем выражение или список аргументов.
        // Продолжаем предыдущую конструкцию.
        null}
        {/* Выводим текстовое содержимое в JSX. */}
      </div>
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <div className="divide-glass-border divide-y">{children}</div>
      {/* Выводим текстовое содержимое в JSX. */}
    </Card>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export default SectionContainer;.
export default SectionContainer;
// — разделитель логических блоков —
