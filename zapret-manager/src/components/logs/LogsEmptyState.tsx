import { SearchX, Terminal } from "lucide-react";

import EmptyState from "@/components/strategies/EmptyState";
import { useI18n } from "@/i18n";

export type LogsEmptyVariant = "empty" | "no-match";

export interface LogsEmptyStateProps {
  variant: LogsEmptyVariant;
  onReset?: () => void;
}

function LogsEmptyState({ variant, onReset }: LogsEmptyStateProps) {
  const { t } = useI18n();

  if (variant === "no-match") {
    return (
      <EmptyState
        icon={<SearchX className="size-7" />}
        title={t("logs.noMatchTitle")}
        description={t("logs.noMatchDesc")}
        action={
          onReset === undefined
            ? undefined
            : { label: t("logs.resetFilters"), onClick: onReset }
        }
      />
    );
  }

  return (
    <EmptyState
      icon={<Terminal className="size-7" />}
      title={t("logs.emptyTitle")}
      description={t("logs.emptyDesc")}
    />
  );
}

export default LogsEmptyState;
