import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Check, FileCode2, ListChecks, Rocket } from "lucide-react";

import { Button, Text } from "@/components/ui";
import Modal from "@/components/ui/Modal";
import { useI18n } from "@/i18n";
import { APP_NAME } from "@/lib/constants";
import { formatResourceVersion } from "@/lib/resources";
import type { InitReport } from "@/types";

export interface FirstRunModalProps {
  open: boolean;
  report: InitReport | null;
  onStart: () => void;
}

const ENTRY_TRANSITION = { duration: 0.4, ease: [0.16, 1, 0.3, 1] } as const;

function FirstRunModal({ open, report, onStart }: FirstRunModalProps) {
  const { t } = useI18n();
  const strategies = report?.strategiesCount ?? 0;

  return (
    <Modal
      open={open}
      onClose={onStart}
      title={t("settings.resources.welcomeTitle")}
      description={t("settings.resources.welcomeBody")}
      size="md"
      closeOnBackdrop={false}
      closeOnEscape={false}
      footer={
        <Button size="lg" onClick={onStart}>
          {t("settings.resources.welcomeAction")}
        </Button>
      }
    >
      <div className="flex flex-col items-center gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={ENTRY_TRANSITION}
          className="bg-accent-primary/15 flex size-20 items-center justify-center rounded-2xl"
        >
          <Rocket
            aria-hidden="true"
            className="text-accent-primary size-9"
            strokeWidth={2}
          />
        </motion.div>

        <ul className="flex w-full flex-col gap-3">
          <Entry
            icon={<ListChecks className="size-4" strokeWidth={2} />}
            label={t("settings.resources.welcomeStrategies").replace(
              "{count}",
              String(strategies)
            )}
          />
          <Entry
            icon={<FileCode2 className="size-4" strokeWidth={2} />}
            label={t("settings.resources.welcomeEngine")}
          />
          <Entry
            icon={<Check className="size-4" strokeWidth={2} />}
            label={t("settings.resources.welcomeConfigs")}
          />
        </ul>

        <Text variant="caption" size="sm" className="text-text-tertiary">
          {t("settings.resources.welcomeVersion").replace(
            "{version}",
            formatResourceVersion(report?.resourcesVersion ?? "", t)
          ) + ` · ${APP_NAME}`}
        </Text>
      </div>
    </Modal>
  );
}

function Entry({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <li className="border-glass-border bg-glass-bg flex items-center gap-3 rounded-lg border px-3 py-2">
      <span className="text-accent-primary shrink-0">{icon}</span>
      <span className="text-text-primary text-sm">{label}</span>
      <Check
        aria-hidden="true"
        className="text-accent-primary ml-auto size-4 shrink-0"
        strokeWidth={2.5}
      />
    </li>
  );
}

export default FirstRunModal;
