import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Check, Loader2 } from "lucide-react";

import { useSettingsStore } from "@/stores/useSettingsStore";
import { createTranslate } from "@/i18n";

function SaveIndicator() {
  const saveState = useSettingsStore((state) => state.saveState);
  const language = useSettingsStore((state) => state.settings.general.language);
  const t = createTranslate(language);

  const visible = saveState === "saving" || saveState === "saved";

  const label =
    saveState === "error"
      ? t("settings.common.saveFailed")
      : saveState === "saving"
        ? t("settings.common.saving")
        : t("settings.common.saved");

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.2 }}
          className="bg-bg-secondary/90 border-glass-border pointer-events-none fixed right-6 bottom-6 z-40 flex items-center gap-2 rounded-full border px-4 py-2 text-xs backdrop-blur-xl"
        >
          {saveState === "saving" ? (
            <Loader2
              aria-hidden="true"
              className="text-accent-primary size-3.5 animate-spin"
            />
          ) : (
            <Check
              aria-hidden="true"
              className="text-accent-primary size-3.5"
              strokeWidth={2}
            />
          )}
          {label}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function SaveErrorIndicator() {
  const saveState = useSettingsStore((state) => state.saveState);
  const language = useSettingsStore((state) => state.settings.general.language);
  const t = createTranslate(language);

  return (
    <AnimatePresence>
      {saveState === "error" ? (
        <motion.div
          role="alert"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.2 }}
          className="text-accent-danger bg-bg-secondary/90 border-accent-danger/30 pointer-events-none fixed right-6 bottom-6 z-40 flex items-center gap-2 rounded-full border px-4 py-2 text-xs backdrop-blur-xl"
        >
          <AlertTriangle aria-hidden="true" className="size-3.5" />
          {t("settings.common.saveFailed")}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default SaveIndicator;
