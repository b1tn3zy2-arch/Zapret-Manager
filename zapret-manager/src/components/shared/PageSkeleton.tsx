// Импортируем зависимости из модуля @/components/ui.
import { Card, Skeleton } from "@/components/ui";
// — разделитель логических блоков —

// Обрабатываем конструкцию: const PANEL_HEIGHTS = [h-32, h-24, h-40] as const.
const PANEL_HEIGHTS = ["h-32", "h-24", "h-40"] as const;
// — разделитель логических блоков —

// Объявляем функцию PageSkeleton.
function PageSkeleton() {
  // Возвращаем результат: ( <section aria-busy=true aria-live=polite className=fl….
  return (
    // Обрабатываем конструкцию: <section aria-busy=true aria-live=polite className=flex….
    <section
      // Обрабатываем конструкцию: aria-busy.
      aria-busy="true"
      // Обрабатываем конструкцию: aria-live.
      aria-live="polite"
      // Обрабатываем конструкцию: className.
      className="flex flex-col gap-6"
      // Продолжаем выражение.
    >
      {/* Выводим текстовое содержимое в JSX. */}
      <span className="sr-only">Загрузка страницы</span>
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <div className="flex flex-col gap-2">
        {/* Выводим текстовое содержимое в JSX. */}
        <Skeleton className="h-9 w-64" />
        {/* Выводим текстовое содержимое в JSX. */}
        <Skeleton className="h-4 w-80" />
        {/* Выводим текстовое содержимое в JSX. */}
      </div>
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Выводим текстовое содержимое в JSX. */}
        {PANEL_HEIGHTS.map((height, index) => (
          // Обрабатываем конструкцию: <Card key={height + index.toString()} padding=lg classN….
          <Card
            // Обрабатываем конструкцию: key.
            key={height + index.toString()}
            // Обрабатываем конструкцию: padding.
            padding="lg"
            // Обрабатываем конструкцию: className.
            className="flex flex-col gap-3"
            // Продолжаем выражение.
          >
            {/* Выводим текстовое содержимое в JSX. */}
            <Skeleton className="h-4 w-32" />
            {/* Выводим текстовое содержимое в JSX. */}
            <Skeleton variant="rect" height={height} />
            {/* Выводим текстовое содержимое в JSX. */}
          </Card>
          // Закрываем выражение или список аргументов.
        ))}
        {/* Выводим текстовое содержимое в JSX. */}
      </div>
      {/* Выводим текстовое содержимое в JSX. */}
    </section>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export default PageSkeleton;.
export default PageSkeleton;
// — разделитель логических блоков —
