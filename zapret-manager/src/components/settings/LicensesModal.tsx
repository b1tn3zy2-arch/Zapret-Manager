import { useState } from "react";
import { ExternalLink, FileText } from "lucide-react";

import type { TranslationKey } from "@/i18n";

import { Button, Modal, Text } from "@/components/ui";
import { useI18n } from "@/i18n";
import * as commands from "@/lib/resourceCommands";
import { toErrorMessage } from "@/lib/utils";

export interface LicensesModalProps {
  open: boolean;
  onClose: () => void;
}

interface LicenseEntry {
  id: string;
  label: TranslationKey;
  license: string;
  url: string;
  file?: string;
}

const LICENSES: LicenseEntry[] = [
  {
    id: "zapret",
    label: "settings.licenses.item.zapret",
    license: "MIT",
    url: "https://github.com/bol-van/zapret",
    file: "LICENSE-zapret.txt",
  },
  {
    id: "zapretNotes",
    label: "settings.licenses.item.zapretNotes",
    license: "MIT",
    url: "https://github.com/Flowseal/zapret-discord-youtube",
    file: "README-zapret.md",
  },
  {
    id: "tauri",
    label: "settings.licenses.item.tauri",
    license: "MIT / Apache-2.0",
    url: "https://github.com/tauri-apps/tauri",
  },
  {
    id: "react",
    label: "settings.licenses.item.react",
    license: "MIT",
    url: "https://github.com/facebook/react",
  },
  {
    id: "lucide",
    label: "settings.licenses.item.lucide",
    license: "ISC",
    url: "https://github.com/lucide-icons/lucide",
  },
  {
    id: "framerMotion",
    label: "settings.licenses.item.framerMotion",
    license: "MIT",
    url: "https://github.com/motiondivision/motion",
  },
];

function LicensesModal({ open, onClose }: LicensesModalProps) {
  const { t } = useI18n();
  const [active, setActive] = useState<LicenseEntry | null>(null);
  const [text, setText] = useState("");

  const openEntry = (entry: LicenseEntry): void => {
    setActive(entry);

    if (entry.file === undefined) {
      setText("");

      return;
    }

    void commands
      .readLicense(entry.file)
      .then((value) => {
        setText(value);
      })
      .catch((caught: unknown) => {
        setText(toErrorMessage(caught));
      });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t("settings.licenses.title")}
      description={t("settings.licenses.description")}
      size="lg"
    >
      <div className="flex flex-col gap-3">
        {LICENSES.map((entry) => (
          <div
            key={entry.id}
            className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/5 px-3 py-2"
          >
            <button
              type="button"
              onClick={() => {
                openEntry(entry);
              }}
              className="text-text-primary hover:text-accent-primary flex items-center gap-2 text-sm"
            >
              <FileText aria-hidden="true" className="size-4" strokeWidth={2} />
              {t(entry.label)}
            </button>

            <Text variant="caption" size="sm" className="text-text-tertiary">
              {entry.license}
            </Text>

            <a
              href={entry.url}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={t("settings.licenses.openSource")}
              className="text-text-tertiary hover:text-text-primary ml-auto"
            >
              <ExternalLink
                aria-hidden="true"
                className="size-4"
                strokeWidth={2}
              />
            </a>
          </div>
        ))}

        {active !== null ? (
          <div className="flex flex-col gap-2 pt-2">
            <div className="flex items-center justify-between gap-3">
              <Text variant="label" className="text-text-primary">
                {t(active.label)}
              </Text>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setActive(null);
                }}
              >
                {t("settings.licenses.close")}
              </Button>
            </div>

            <pre className="text-text-secondary max-h-64 scrollbar-thin overflow-auto rounded-lg border border-white/10 bg-black/30 p-3 font-mono text-xs whitespace-pre-wrap">
              {active.file === undefined
                ? t("settings.licenses.remoteOnly")
                : text}
            </pre>
          </div>
        ) : null}
      </div>
    </Modal>
  );
}

export default LicensesModal;
