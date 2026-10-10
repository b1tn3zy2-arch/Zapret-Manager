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
    label: "licenses.item.zapret",
    license: "MIT",
    url: "https://github.com/bol-van/zapret",
    file: "LICENSE-zapret.txt",
  },
  {
    id: "zapretNotes",
    label: "licenses.item.zapretNotes",
    license: "MIT",
    url: "https://github.com/Flowseal/zapret-discord-youtube",
    file: "README-zapret.md",
  },
  {
    id: "tauri",
    label: "licenses.item.tauri",
    license: "MIT / Apache-2.0",
    url: "https://github.com/tauri-apps/tauri",
  },
  {
    id: "react",
    label: "licenses.item.react",
    license: "MIT",
    url: "https://github.com/facebook/react",
  },
  {
    id: "lucide",
    label: "licenses.item.lucide",
    license: "ISC",
    url: "https://github.com/lucide-icons/lucide",
  },
  {
    id: "framerMotion",
    label: "licenses.item.framerMotion",
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
      title={t("licenses.title")}
      description={t("licenses.description")}
      size="lg"
    >
      <div className="flex flex-col gap-3">
        {LICENSES.map((entry) => (
          <div
            key={entry.id}
            className="border-glass-border bg-glass-bg flex items-center gap-3 rounded-lg border px-3 py-2"
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
              aria-label={t("licenses.openSource")}
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
                {t("licenses.close")}
              </Button>
            </div>

            <pre className="text-text-secondary border-glass-border bg-glass-bg max-h-64 scrollbar-thin overflow-auto rounded-lg border p-3 font-mono text-xs whitespace-pre-wrap">
              {active.file === undefined ? t("licenses.remoteOnly") : text}
            </pre>
          </div>
        ) : null}
      </div>
    </Modal>
  );
}

export default LicensesModal;
