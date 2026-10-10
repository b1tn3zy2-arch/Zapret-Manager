import { Plus } from "lucide-react";

import { Button } from "@/components/ui";
import { useI18n } from "@/i18n";

export interface AddGameButtonProps {
  disabled: boolean;
  onClick: () => void;
}

export default function AddGameButton({
  disabled,
  onClick,
}: AddGameButtonProps) {
  const { t } = useI18n();

  return (
    <Button
      fullWidth
      variant="secondary"
      disabled={disabled}
      onClick={onClick}
      icon={<Plus aria-hidden="true" className="size-4" strokeWidth={2.5} />}
    >
      {t("settings.games.add")}
    </Button>
  );
}
