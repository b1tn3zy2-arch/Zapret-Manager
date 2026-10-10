import { Link2 } from "lucide-react";

import { Button, Text } from "@/components/ui";
import { useI18n } from "@/i18n";

export interface EmptyStateProps {
  disabled: boolean;
  onAddLink: () => void;
}

export default function EmptyState({ disabled, onAddLink }: EmptyStateProps) {
  const { t } = useI18n();

  return (
    <div className="border-glass-border bg-glass-bg flex flex-col items-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center">
      <span
        aria-hidden="true"
        className="text-accent-primary bg-accent-primary/10 flex size-14 items-center justify-center rounded-full"
      >
        <Link2 className="size-6" strokeWidth={2} />
      </span>

      <Text variant="label" className="text-text-primary">
        {t("dashboard.vpn.noConfigs")}
      </Text>

      <Text variant="body" size="sm" className="text-text-tertiary">
        {t("dashboard.vpn.noConfigsHint")}
      </Text>

      <Button
        size="sm"
        disabled={disabled}
        onClick={onAddLink}
        icon={<Link2 aria-hidden="true" className="size-4" strokeWidth={2} />}
      >
        {t("dashboard.vpn.addLink")}
      </Button>
    </div>
  );
}
