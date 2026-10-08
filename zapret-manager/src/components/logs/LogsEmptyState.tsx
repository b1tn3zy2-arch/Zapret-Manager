import { SearchX, Terminal } from "lucide-react";

import EmptyState from "@/components/strategies/EmptyState";

export type LogsEmptyVariant = "empty" | "no-match";

export interface LogsEmptyStateProps {
  variant: LogsEmptyVariant;
  onReset?: () => void;
}

function LogsEmptyState({ variant, onReset }: LogsEmptyStateProps) {
  if (variant === "no-match") {
    return (
      <EmptyState
        icon={<SearchX className="size-7" />}
        title="Ничего не найдено"
        description="Под текущие фильтры не подошёл ни один лог"
        action={
          onReset === undefined
            ? undefined
            : { label: "Сбросить фильтры", onClick: onReset }
        }
      />
    );
  }

  return (
    <EmptyState
      icon={<Terminal className="size-7" />}
      title="Логи пусты"
      description="Запустите стратегию, чтобы увидеть логи"
    />
  );
}

export default LogsEmptyState;
