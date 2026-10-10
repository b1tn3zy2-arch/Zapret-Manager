import {
  ClipboardCopy,
  ExternalLink,
  FolderOpen,
  RefreshCw,
  Scale,
} from "lucide-react";

import { Button, Text } from "@/components/ui";
import { ABOUT_LINKS } from "@/lib/settingsConstants";
import { openExternalUrl } from "@/lib/userCommands";
import type { Translate } from "@/i18n";

export interface AboutActionsProps {
  canOpenStrategies: boolean;
  canCopyInfo: boolean;
  copied: boolean;
  onCheckUpdates: () => void;
  onOpenFolder: (kind: "logs" | "config" | "strategies") => void;
  onOpenLicenses: () => void;
  onCopyInfo: () => void;
  t: Translate;
}

export default function AboutActions({
  canOpenStrategies,
  canCopyInfo,
  copied,
  onCheckUpdates,
  onOpenFolder,
  onOpenLicenses,
  onCopyInfo,
  t,
}: AboutActionsProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={onCheckUpdates}
          icon={<RefreshCw aria-hidden="true" className="size-4" />}
        >
          {t("about.checkUpdates")}
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            onOpenFolder("logs");
          }}
          icon={<FolderOpen aria-hidden="true" className="size-4" />}
        >
          {t("about.openLogs")}
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            onOpenFolder("config");
          }}
          icon={<FolderOpen aria-hidden="true" className="size-4" />}
        >
          {t("about.openConfig")}
        </Button>

        <Button
          size="sm"
          variant="ghost"
          disabled={!canOpenStrategies}
          onClick={() => {
            onOpenFolder("strategies");
          }}
          icon={<FolderOpen aria-hidden="true" className="size-4" />}
        >
          {t("about.openStrategies")}
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onClick={onOpenLicenses}
          icon={<Scale aria-hidden="true" className="size-4" />}
        >
          {t("about.licenses")}
        </Button>

        <Button
          size="sm"
          variant="ghost"
          disabled={!canCopyInfo}
          onClick={onCopyInfo}
          icon={<ClipboardCopy aria-hidden="true" className="size-4" />}
        >
          {copied ? t("settings.common.saved") : t("about.copyInfo")}
        </Button>
      </div>

      <Text variant="label" className="text-text-primary">
        {t("about.links")}
      </Text>

      <div className="flex flex-wrap gap-2">
        {ABOUT_LINKS.map((link) => (
          <Button
            key={link.id}
            size="sm"
            variant="ghost"
            onClick={() => {
              void openExternalUrl(link.url).catch(() => undefined);
            }}
            icon={<ExternalLink aria-hidden="true" className="size-4" />}
          >
            {t(link.labelKey)}
          </Button>
        ))}
      </div>
    </div>
  );
}
