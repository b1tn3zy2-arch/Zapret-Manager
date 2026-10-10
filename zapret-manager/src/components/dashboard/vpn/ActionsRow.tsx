import { ClipboardPaste, Plus, Settings } from "lucide-react";

import { Button } from "@/components/ui";
import { useI18n } from "@/i18n";

export interface ActionsRowProps {
  disabled: boolean;
  onAddFile: () => void;
  onPaste: () => void;
  onOpenSettings: () => void;
}

export default function ActionsRow({
  disabled,
  onAddFile,
  onPaste,
  onOpenSettings,
}: ActionsRowProps) {
  const { t } = useI18n();

  return (
    <div className="grid grid-cols-[1fr_1fr_auto] items-stretch gap-2">
      <Button
        size="lg"
        disabled={disabled}
        onClick={onAddFile}
        icon={<Plus aria-hidden="true" className="size-4" strokeWidth={2.5} />}
      >
        {t("dashboard.vpn.add")}
      </Button>

      <Button
        size="lg"
        variant="secondary"
        disabled={disabled}
        onClick={onPaste}
        icon={
          <ClipboardPaste
            aria-hidden="true"
            className="size-4"
            strokeWidth={2.5}
          />
        }
      >
        {t("dashboard.vpn.paste")}
      </Button>

      <Button
        size="lg"
        variant="ghost"
        aria-label={t("dashboard.vpn.settings")}
        onClick={onOpenSettings}
        icon={
          <Settings aria-hidden="true" className="size-4" strokeWidth={2.5} />
        }
      />
    </div>
  );
}
