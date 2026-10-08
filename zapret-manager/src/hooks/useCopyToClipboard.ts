import { useCallback, useEffect, useRef, useState } from "react";

import { COPY_TOAST_DURATION_MS } from "@/lib/constants";

export interface UseCopyToClipboardResult {
  copy: (text: string) => Promise<void>;
  copied: boolean;
}

export function useCopyToClipboard(
  duration: number = COPY_TOAST_DURATION_MS
): UseCopyToClipboardResult {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    return () => {
      if (timerRef.current !== undefined) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const copy = useCallback(
    async (text: string): Promise<void> => {
      if (timerRef.current !== undefined) {
        window.clearTimeout(timerRef.current);
      }

      await navigator.clipboard.writeText(text);

      setCopied(true);

      timerRef.current = window.setTimeout(() => {
        setCopied(false);
        timerRef.current = undefined;
      }, duration);
    },
    [duration]
  );

  return { copy, copied };
}
