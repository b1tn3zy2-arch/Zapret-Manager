import { Fragment, memo } from "react";

import { buildSearchMatcher } from "@/lib/format";

export interface HighlightTextProps {
  text: string;
  query?: string | undefined;
}

function HighlightTextImpl({ text, query }: HighlightTextProps) {
  const matcher = query === undefined ? null : buildSearchMatcher(query);

  if (matcher === null) {
    return <>{text}</>;
  }

  const parts = text.split(matcher);

  return (
    <>
      {parts.map((part, index) => {
        const isMatch = matcher.test(part);

        matcher.lastIndex = 0;

        if (!isMatch || part === "") {
          return <Fragment key={index}>{part}</Fragment>;
        }

        return (
          <mark
            key={index}
            className="rounded-sm bg-amber-400/30 px-px text-amber-200"
          >
            {part}
          </mark>
        );
      })}
    </>
  );
}

const HighlightText = memo(HighlightTextImpl);

export default HighlightText;
