import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { openExternalUrl } from "@/lib/userCommands";

export interface ChangelogRendererProps {
  markdown: string;
}

const PROSE_CLASSES = [
  "text-text-secondary space-y-2 text-sm leading-relaxed",
  "[&_a]:text-accent-primary [&_a]:underline",
  "[&_code]:text-accent-secondary [&_code]:font-mono [&_code]:text-xs",
  "[&_h1]:text-text-primary [&_h1]:text-base [&_h1]:font-bold",
  "[&_h2]:text-text-primary [&_h2]:text-sm [&_h2]:font-bold",
  "[&_h3]:text-text-primary [&_h3]:text-sm [&_h3]:font-semibold",
  "[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5",
  "[&_li]:marker:text-text-tertiary",
  "[&_blockquote]:border-glass-border [&_blockquote]:text-text-tertiary [&_blockquote]:border-l-2 [&_blockquote]:pl-3",
  "[&_pre]:bg-bg-secondary [&_pre]:overflow-x-auto [&_pre]:rounded-md [&_pre]:p-3",
  "[&_table]:w-full [&_td]:border-glass-border [&_td]:border [&_td]:p-1 [&_th]:border-glass-border [&_th]:border [&_th]:p-1",
].join(" ");

function ChangelogRenderer({ markdown }: ChangelogRendererProps) {
  if (markdown.trim() === "") {
    return (
      <p className="text-text-tertiary text-sm">
        Описание изменений в релизе отсутствует.
      </p>
    );
  }

  return (
    <div className={PROSE_CLASSES}>
      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => (
            <a
              href={href}
              rel="noopener noreferrer"
              onClick={(event) => {
                event.preventDefault();

                if (href !== undefined && href !== "") {
                  void openExternalUrl(href);
                }
              }}
            >
              {children}
            </a>
          ),
        }}
      >
        {markdown}
      </Markdown>
    </div>
  );
}

export default ChangelogRenderer;
