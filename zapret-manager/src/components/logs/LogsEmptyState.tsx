import { SearchX, Terminal } from "lucide-react";

import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";

export type LogsEmptyVariant = "empty" | "no-match" | "disabled";

export interface LogsEmptyStateProps {
  variant: LogsEmptyVariant;
  onReset?: () => void;
}

function LogsEmptyState({ variant, onReset }: LogsEmptyStateProps) {
  const { t } = useI18n();

  if (variant === "no-match") {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-center">
        <div className="bg-glass-bg text-text-tertiary flex size-16 items-center justify-center rounded-full">
          <SearchX className="size-7" />
        </div>

        <h3 className="text-text-primary text-lg font-semibold">
          {t("logs.noMatchTitle")}
        </h3>

        <p className="text-text-secondary max-w-md text-sm">
          {t("logs.noMatchDesc")}
        </p>

        {onReset === undefined ? null : (
          <button
            type="button"
            onClick={onReset}
            className={cn(
              "text-text-primary border-glass-border hover:bg-glass-hover mt-1",
              "rounded-lg border px-4 py-2 text-sm transition-colors"
            )}
          >
            {t("logs.resetFilters")}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-center">
      <div className="bg-glass-bg text-text-secondary flex size-16 items-center justify-center rounded-full">
        <Terminal className="size-7" />
      </div>

      <h3 className="text-text-secondary text-lg font-semibold">
        {variant === "disabled"
          ? t("logs.disabledTitle")
          : t("logs.emptyTitle")}
      </h3>

      <p className="text-text-secondary max-w-md text-sm">
        {variant === "disabled" ? t("logs.disabledDesc") : t("logs.emptyDesc")}
      </p>
    </div>
  );
}

export default LogsEmptyState;
