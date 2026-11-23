// Импортируем зависимости из модуля @/i18n.
import { useI18n } from "@/i18n";
// Импортируем зависимости из модуля react-markdown.
import Markdown from "react-markdown";
// Импортируем зависимости из модуля remark-gfm.
import remarkGfm from "remark-gfm";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/lib/userCommands.
import { openExternalUrl } from "@/lib/userCommands";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface ChangelogRendererProps {
  // Обрабатываем конструкцию: markdown.
  markdown: string;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: const PROSE_CLASSES = [ text-text-secondary space-y-2 t….
const PROSE_CLASSES = [
  // Обрабатываем конструкцию: text-text-secondary space-y-2 text-sm leading-relaxed.
  "text-text-secondary space-y-2 text-sm leading-relaxed",
  // Обрабатываем конструкцию: [&_a]:text-accent-primary [&_a]:underline.
  "[&_a]:text-accent-primary [&_a]:underline",
  // Обрабатываем конструкцию: [&_code]:text-accent-secondary [&_code]:font-mono [&_co….
  "[&_code]:text-accent-secondary [&_code]:font-mono [&_code]:text-xs",
  // Обрабатываем конструкцию: [&_h1]:text-text-primary [&_h1]:text-base [&_h1]:font-b….
  "[&_h1]:text-text-primary [&_h1]:text-base [&_h1]:font-bold",
  // Обрабатываем конструкцию: [&_h2]:text-text-primary [&_h2]:text-sm [&_h2]:font-bol….
  "[&_h2]:text-text-primary [&_h2]:text-sm [&_h2]:font-bold",
  // Обрабатываем конструкцию: [&_h3]:text-text-primary [&_h3]:text-sm [&_h3]:font-sem….
  "[&_h3]:text-text-primary [&_h3]:text-sm [&_h3]:font-semibold",
  // Обрабатываем конструкцию: [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]….
  "[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5",
  // Обрабатываем конструкцию: [&_li]:marker:text-text-tertiary.
  "[&_li]:marker:text-text-tertiary",
  // Обрабатываем конструкцию: [&_blockquote]:border-glass-border [&_blockquote]:text-….
  "[&_blockquote]:border-glass-border [&_blockquote]:text-text-tertiary [&_blockquote]:border-l-2 [&_blockquote]:pl-3",
  // Обрабатываем конструкцию: [&_pre]:bg-bg-secondary [&_pre]:overflow-x-auto [&_pre]….
  "[&_pre]:bg-bg-secondary [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:p-3",
  // Обрабатываем конструкцию: [&_table]:w-full [&_td]:border-glass-border [&_td]:bord….
  "[&_table]:w-full [&_td]:border-glass-border [&_td]:border [&_td]:p-1 [&_th]:border-glass-border [&_th]:border [&_th]:p-1",
  // Закрываем массив или список.
].join(" ");
// — разделитель логических блоков —

// Объявляем функцию ChangelogRenderer.
function ChangelogRenderer({ markdown }: ChangelogRendererProps) {
  // Обрабатываем конструкцию: const { t } = useI18n().
  const { t } = useI18n();
  // Проверяем бизнес-условие: markdown.trim() ===.
  if (markdown.trim() === "") {
    // Возвращаем результат: ( <p className=text-text-tertiary text-sm> {t(updates.c….
    return (
      // Обрабатываем конструкцию: <p className=text-text-tertiary text-sm>.
      <p className="text-text-tertiary text-sm">
        {/* Выводим текстовое содержимое в JSX. */}
        {t("updates.changelogEmpty")}
        {/* Выводим текстовое содержимое в JSX. */}
      </p>
      // Закрываем выражение или список аргументов.
    );
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: ( <div className={PROSE_CLASSES}> <Markdown remarkPlugi….
  return (
    // Обрабатываем конструкцию: <div className={PROSE_CLASSES}>.
    <div className={PROSE_CLASSES}>
      {/* Выводим текстовое содержимое в JSX. */}
      <Markdown
        // Обрабатываем конструкцию: remarkPlugins.
        remarkPlugins={[remarkGfm]}
        // Обрабатываем конструкцию: components.
        components={{
          // Обрабатываем конструкцию: a.
          a: ({ href, children }) => (
            // Обрабатываем конструкцию: <a href={href} rel=noopener noreferrer onClick={(event)….
            <a
              // Обрабатываем конструкцию: href.
              href={href}
              // Обрабатываем конструкцию: rel.
              rel="noopener noreferrer"
              // Обрабатываем конструкцию: onClick.
              onClick={(event) => {
                // Обрабатываем конструкцию: event.
                event.preventDefault();
                // — разделитель логических блоков —

                // Проверяем бизнес-условие: href !== undefined && href !==.
                if (href !== undefined && href !== "") {
                  // Обрабатываем конструкцию: void openExternalUrl(href).
                  void openExternalUrl(href);
                  // Закрываем текущий блок.
                }
                // Закрываем текущий блок.
              }}
              // Продолжаем выражение.
            >
              {/* Выводим текстовое содержимое в JSX. */}
              {children}
              {/* Выводим текстовое содержимое в JSX. */}
            </a>
            // Закрываем выражение или список аргументов.
          ),
          // Закрываем текущий блок.
        }}
        // Продолжаем выражение.
      >
        {/* Выводим текстовое содержимое в JSX. */}
        {markdown}
        {/* Выводим текстовое содержимое в JSX. */}
      </Markdown>
      {/* Выводим текстовое содержимое в JSX. */}
    </div>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export default ChangelogRenderer;.
export default ChangelogRenderer;
// — разделитель логических блоков —
