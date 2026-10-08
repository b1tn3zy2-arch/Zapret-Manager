import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Check, Info } from "lucide-react";

import { ANIMATION } from "@/lib/constants";
import { cn } from "@/lib/utils";

export type ToastTone = "success" | "error" | "info";

export interface LogsToastProps {
  message: string | null;
  tone: ToastTone;
}

const TONE_CLASSES = {
  success: "border-accent-primary/40 text-accent-primary",
  error: "border-accent-danger/40 text-accent-danger",
  info: "border-white/15 text-text-primary",
} as const satisfies Record<ToastTone, string>;

const TONE_ICONS = {
  success: Check,
  error: AlertCircle,
  info: Info,
} as const satisfies Record<ToastTone, typeof Check>;

function LogsToast({ message, tone }: LogsToastProps) {
  const Icon = TONE_ICONS[tone];

  return (
    <AnimatePresence>
      {message !== null ? (
        <motion.div
          key="logs-toast"
          role="status"
          aria-live="polite"
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.96 }}
          transition={{ duration: ANIMATION.fast, ease: "easeOut" }}
          className={cn(
            "bg-bg-secondary/95 pointer-events-none absolute bottom-6 left-1/2 z-30",
            "-translate-x-1/2 rounded-lg border px-4 py-2 text-sm shadow-lg backdrop-blur",
            TONE_CLASSES[tone]
          )}
        >
          <span className="flex items-center gap-2">
            <Icon aria-hidden="true" className="size-4 shrink-0" />
            {message}
          </span>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default LogsToast;
