// Импортируем зависимости из модуля lucide-react.
import { Shield } from "lucide-react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/components/ui.
import { Badge, Heading, Text } from "@/components/ui";
// Импортируем зависимости из модуля @/lib/constants.
import { APP_NAME } from "@/lib/constants";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface AboutIdentityProps {
  // Обрабатываем конструкцию: appVersion.
  appVersion: string;
  // Обрабатываем конструкцию: resourcesVersion.
  resourcesVersion: string;
  // Обрабатываем конструкцию: resourcesLabel.
  resourcesLabel: string;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export default function AboutIdentity({
  // Обрабатываем конструкцию: appVersion.
  appVersion,
  // Обрабатываем конструкцию: resourcesVersion.
  resourcesVersion,
  // Обрабатываем конструкцию: resourcesLabel.
  resourcesLabel,
  // Закрываем текущий блок.
}: AboutIdentityProps) {
  // Возвращаем результат: ( <header className=flex flex-col gap-3> <div className….
  return (
    // Обрабатываем конструкцию: <header className=flex flex-col gap-3>.
    <header className="flex flex-col gap-3">
      {/* Выводим текстовое содержимое в JSX. */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Выводим текстовое содержимое в JSX. */}
        <span
          // Обрабатываем конструкцию: className.
          className="text-accent-primary bg-accent-primary/10 flex size-12 shrink-0 items-center justify-center rounded-xl"
          // Обрабатываем конструкцию: aria-hidden.
          aria-hidden="true"
          // Продолжаем выражение.
        >
          {/* Выводим текстовое содержимое в JSX. */}
          <Shield className="size-7" strokeWidth={2} />
          {/* Выводим текстовое содержимое в JSX. */}
        </span>
        {/* — разделитель логических блоков — */}

        {/* Выводим текстовое содержимое в JSX. */}
        <div className="flex flex-col gap-1">
          {/* Выводим текстовое содержимое в JSX. */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Выводим текстовое содержимое в JSX. */}
            <Heading level={1}>{APP_NAME}</Heading>
            {/* Выводим текстовое содержимое в JSX. */}
            <Badge variant="neutral">{appVersion}</Badge>
            {/* Выводим текстовое содержимое в JSX. */}
          </div>
          {/* Выводим текстовое содержимое в JSX. */}
          <Text variant="body" size="sm" className="text-text-secondary">
            {/* Выводим текстовое содержимое в JSX. */}
            By: Ivan Grafov
            {/* Обрабатываем конструкцию: </Text>. */}
          </Text>
          {/* Выводим текстовое содержимое в JSX. */}
          <Text variant="body" size="sm" className="text-text-secondary">
            {/* Выводим текстовое содержимое в JSX. */}
            {resourcesLabel} {resourcesVersion}
            {/* Выводим текстовое содержимое в JSX. */}
          </Text>
          {/* Выводим текстовое содержимое в JSX. */}
        </div>
        {/* Выводим текстовое содержимое в JSX. */}
      </div>
      {/* Выводим текстовое содержимое в JSX. */}
    </header>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
