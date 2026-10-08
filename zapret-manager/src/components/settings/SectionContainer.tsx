import type { ReactNode } from "react";
import { RotateCcw } from "lucide-react";

import { Button, Card, Text } from "@/components/ui";

export interface SectionContainerProps {
  title: string;
  description?: string;
  onReset?: (() => void) | undefined;
  resetLabel?: string;
  children: ReactNode;
}

function SectionContainer({
  title,
  description,
  onReset,
  resetLabel,
  children,
}: SectionContainerProps) {
  return (
    <Card className="flex flex-col gap-2" padding="lg">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-text-primary text-lg font-semibold">{title}</h2>
          {description !== undefined ? (
            <Text variant="body" size="sm" className="text-text-secondary">
              {description}
            </Text>
          ) : null}
        </div>

        {onReset !== undefined && resetLabel !== undefined ? (
          <Button
            size="sm"
            variant="ghost"
            onClick={onReset}
            icon={<RotateCcw aria-hidden="true" className="size-3.5" />}
          >
            {resetLabel}
          </Button>
        ) : null}
      </div>

      <div className="divide-y divide-white/5">{children}</div>
    </Card>
  );
}

export default SectionContainer;
