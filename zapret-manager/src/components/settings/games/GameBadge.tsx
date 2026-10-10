import { Badge, Tooltip } from "@/components/ui";
import { useI18n } from "@/i18n";
import { Star } from "lucide-react";

export interface GameBadgeProps {
  priority: boolean;
}

export default function GameBadge({ priority }: GameBadgeProps) {
  const { t } = useI18n();

  if (!priority) {
    return null;
  }

  return (
    <Tooltip content={t("settings.games.priorityHint")} side="top">
      <Badge variant="accent" size="sm">
        <Star aria-hidden="true" className="size-3" strokeWidth={2.5} />
        {t("settings.games.priority")}
      </Badge>
    </Tooltip>
  );
}
