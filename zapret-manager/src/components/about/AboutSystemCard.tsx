// Импортируем зависимости из модуля @/components/ui.
import { Card, Text } from "@/components/ui";
// Импортируем зависимости из модуля @/lib/systemInfo.
import { formatOsLabel } from "@/lib/systemInfo";
// Импортируем зависимости из модуля @/i18n.
import type { Translate } from "@/i18n";
// Импортируем зависимости из модуля @/types.
import type { SystemInfo } from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface AboutSystemCardProps {
  // Обрабатываем конструкцию: info.
  info: SystemInfo | null;
  // Обрабатываем конструкцию: t.
  t: Translate;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export default function AboutSystemCard({ info, t }: AboutSystemCardProps) {
  // Обрабатываем конструкцию: const rows = info === null ? [] : [ [t(about.os), forma….
  const rows =
    // Обрабатываем конструкцию: info.
    info === null
      ? // Обрабатываем конструкцию: ?.
        // Продолжаем предыдущую конструкцию.
        []
      : // Обрабатываем конструкцию: :.
        // Продолжаем предыдущую конструкцию.
        [
          // Открываем массив.
          [t("about.os"), formatOsLabel(info)],
          // Открываем массив.
          [t("about.arch"), info.arch],
          // Закрываем массив или список.
        ];
  // — разделитель логических блоков —

  // Возвращаем результат: ( <Card className=flex flex-col gap-3 padding=lg> <Text….
  return (
    // Обрабатываем конструкцию: <Card className=flex flex-col gap-3 padding=lg>.
    <Card className="flex flex-col gap-3" padding="lg">
      {/* Выводим текстовое содержимое в JSX. */}
      <Text variant="label" className="text-text-primary">
        {/* Выводим текстовое содержимое в JSX. */}
        {t("about.system")}
        {/* Выводим текстовое содержимое в JSX. */}
      </Text>
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      {rows.length === 0 ? (
        // Обрабатываем конструкцию: <Text variant=body size=sm className=text-text-tertiary….
        <Text variant="body" size="sm" className="text-text-tertiary">
          {/* Выводим текстовое содержимое в JSX. */}
          {t("about.systemLoading")}
          {/* Выводим текстовое содержимое в JSX. */}
        </Text>
      ) : (
        // Продолжаем предыдущую конструкцию.
        // Закрываем выражение или список аргументов.
        // Обрабатываем конструкцию: <dl className=flex flex-col gap-2>.
        <dl className="flex flex-col gap-2">
          {/* Выводим текстовое содержимое в JSX. */}
          {rows.map(([label, value]) => (
            // Обрабатываем конструкцию: <div key={label} className=flex items-baseline justify-….
            <div
              // Обрабатываем конструкцию: key.
              key={label}
              // Обрабатываем конструкцию: className.
              className="flex items-baseline justify-between gap-4"
              // Продолжаем выражение.
            >
              {/* Выводим текстовое содержимое в JSX. */}
              <dt className="text-text-secondary text-sm">{label}</dt>
              {/* Выводим текстовое содержимое в JSX. */}
              <dd className="text-text-primary truncate font-mono text-sm">
                {/* Выводим текстовое содержимое в JSX. */}
                {value}
                {/* Выводим текстовое содержимое в JSX. */}
              </dd>
              {/* Выводим текстовое содержимое в JSX. */}
            </div>
            // Закрываем выражение или список аргументов.
          ))}
          {/* Выводим текстовое содержимое в JSX. */}
        </dl>
        // Закрываем выражение или список аргументов.
      )}
      {/* Выводим текстовое содержимое в JSX. */}
    </Card>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
