import { ClipboardPaste, Link2 } from "lucide-react";

import { Button } from "@/components/ui";
import { useI18n } from "@/i18n";

export interface ActionsRowProps {
  disabled: boolean;
  onAddLink: () => void;
  onPasteLink: () => void;
}

export default function ActionsRow({
  disabled,
  onAddLink,
  onPasteLink,
}: ActionsRowProps) {
  const { t } = useI18n();

  return (
    <div className="grid w-full max-w-md grid-cols-2 items-stretch gap-2">
      <Button
        size="lg"
        disabled={disabled}
        onClick={onAddLink}
        icon={<Link2 aria-hidden="true" className="size-4" strokeWidth={2.5} />}
      >
        {t("dashboard.vpn.addLink")}
      </Button>

      <Button
        size="lg"
        variant="secondary"
        disabled={disabled}
        onClick={onPasteLink}
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
    </div>
  );
}
