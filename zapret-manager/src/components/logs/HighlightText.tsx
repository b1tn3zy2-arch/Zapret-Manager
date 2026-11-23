// Импортируем зависимости из модуля react.
import { Fragment, memo } from "react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/lib/format.
import { buildSearchMatcher, buildSearchTester } from "@/lib/format";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface HighlightTextProps {
  // Обрабатываем конструкцию: text.
  text: string;
  // Обрабатываем конструкцию: query.
  query?: string | undefined;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию HighlightTextImpl.
function HighlightTextImpl({ text, query }: HighlightTextProps) {
  // Обрабатываем конструкцию: const matcher = query === undefined ? null : buildSearc….
  const matcher = query === undefined ? null : buildSearchMatcher(query);
  // Обрабатываем конструкцию: const tester = query === undefined ? null : buildSearch….
  const tester = query === undefined ? null : buildSearchTester(query);
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: matcher === null || tester === null.
  if (matcher === null || tester === null) {
    // Возвращаем результат: <>{text}</>.
    return <>{text}</>;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const parts = text.split(matcher).
  const parts = text.split(matcher);
  // — разделитель логических блоков —

  // Возвращаем результат: ( <> {parts.map((part, index) => { const isMatch = test….
  return (
    // Обрабатываем конструкцию: <>.
    <>
      {/* Выводим текстовое содержимое в JSX. */}
      {parts.map((part, index) => {
        // Обрабатываем конструкцию: const isMatch = tester.test(part).
        const isMatch = tester.test(part);
        // — разделитель логических блоков —

        // Проверяем бизнес-условие: !isMatch || part ===.
        if (!isMatch || part === "") {
          // Возвращаем результат: <Fragment key={index}>{part}</Fragment>.
          return <Fragment key={index}>{part}</Fragment>;
          // Закрываем текущий блок.
        }
        // — разделитель логических блоков —

        // Возвращаем результат: ( <mark key={index} className=bg-accent-warning/30 text….
        return (
          // Обрабатываем конструкцию: <mark key={index} className=bg-accent-warning/30 text-a….
          <mark
            // Обрабатываем конструкцию: key.
            key={index}
            // Обрабатываем конструкцию: className.
            className="bg-accent-warning/30 text-accent-warning rounded-sm px-px"
            // Продолжаем выражение.
          >
            {/* Выводим текстовое содержимое в JSX. */}
            {part}
            {/* Выводим текстовое содержимое в JSX. */}
          </mark>
          // Закрываем выражение или список аргументов.
        );
        // Закрываем текущий блок.
      })}
      {/* Выводим текстовое содержимое в JSX. */}
    </>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: const HighlightText = memo(HighlightTextImpl).
const HighlightText = memo(HighlightTextImpl);
// — разделитель логических блоков —

// Обрабатываем конструкцию: export default HighlightText;.
export default HighlightText;
// — разделитель логических блоков —
