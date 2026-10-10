import type { ReactNode } from "react";

import { Button, Card } from "@/components/ui";

export interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?:
    | {
        label: string;
        onClick: () => void;
      }
    | undefined;
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <Card className="flex flex-col items-center gap-3 py-12 text-center">
      <div className="text-text-tertiary bg-glass-bg flex size-16 items-center justify-center rounded-full">
        {icon}
      </div>

      <h3 className="text-text-primary text-lg font-semibold">{title}</h3>

      <p className="text-text-secondary max-w-md text-sm">{description}</p>

      {action !== undefined ? (
        <Button onClick={action.onClick}>{action.label}</Button>
      ) : null}
    </Card>
  );
}
