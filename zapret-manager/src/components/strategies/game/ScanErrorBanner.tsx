import { TriangleAlert } from "lucide-react";

import { Button, Text } from "@/components/ui";

export interface ScanErrorBannerProps {
  message: string;
  onRetry: () => void;
}

export function ScanErrorBanner({ message, onRetry }: ScanErrorBannerProps) {
  return (
    <div className="border-accent-danger/30 bg-accent-danger/10 flex items-center gap-3 rounded-lg border px-4 py-3">
      <TriangleAlert
        aria-hidden="true"
        className="text-accent-danger size-5 shrink-0"
        strokeWidth={2}
      />
      <Text variant="body" size="sm" className="text-accent-danger flex-1">
        {message}
      </Text>
      <Button size="sm" variant="secondary" onClick={onRetry}>
        Повторить
      </Button>
    </div>
  );
}
