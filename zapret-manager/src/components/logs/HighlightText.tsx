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
            className="bg-accent-warning/30 text-accent-warning rounded-sm px-px"
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
