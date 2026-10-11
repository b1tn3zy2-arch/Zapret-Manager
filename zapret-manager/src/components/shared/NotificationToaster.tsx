import { listen } from "@tauri-apps/api/event";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Check, Info, TriangleAlert, X } from "lucide-react";

import { useI18n } from "@/i18n";
import { NOTIFY_EVENT } from "@/lib/constants";
import { parseNotify } from "@/lib/notifyProtocol";
import { cn } from "@/lib/utils";
import {
  TOAST_TTL_MS,
  useToastsStore,
  type AppToast,
} from "@/stores/useToastsStore";
import type { NotificationKind } from "@/types";

const KIND_STYLES: Record<NotificationKind, string> = {
  success: "border-accent-primary/40 text-accent-primary",
  error: "border-accent-danger/40 text-accent-danger",
  warning: "border-accent-warning/40 text-accent-warning",
  info: "border-glass-border text-text-primary",
};

const KIND_ICONS = {
  success: Check,
  error: AlertCircle,
  warning: TriangleAlert,
  info: Info,
} as const satisfies Record<NotificationKind, typeof Check>;

function ToastCard({ toast }: { toast: AppToast }) {
  const { t } = useI18n();
  const dismiss = useToastsStore((state) => state.dismiss);
  const Icon = KIND_ICONS[toast.kind];

  useEffect(() => {
    const timer = window.setTimeout(() => {
      dismiss(toast.id);
    }, TOAST_TTL_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [dismiss, toast.id]);

  return (
    <motion.div
      layout
      role="status"
      aria-live="polite"
      initial={{ opacity: 0, x: 32, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 32, scale: 0.96 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "bg-bg-secondary/95 pointer-events-auto flex w-[320px] items-start gap-2.5",
        "rounded-xl border p-3 shadow-2xl backdrop-blur-xl",
        KIND_STYLES[toast.kind]
      )}
    >
      <Icon
        aria-hidden="true"
        className="mt-0.5 size-4 shrink-0"
        strokeWidth={2}
      />

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-text-primary truncate text-sm font-semibold">
          {toast.title}
        </span>
        {toast.body === "" ? null : (
          <span className="text-text-secondary text-xs break-words">
            {toast.body}
          </span>
        )}
      </div>

      <button
        type="button"
        aria-label={t("common.close")}
        onClick={() => {
          dismiss(toast.id);
        }}
        className="text-text-tertiary hover:text-text-primary shrink-0 rounded p-0.5 transition-colors"
      >
        <X aria-hidden="true" className="size-3.5" />
      </button>
    </motion.div>
  );
}

export default function NotificationToaster() {
  const toasts = useToastsStore((state) => state.toasts);

  useEffect(() => {
    const subscription = listen<string>(NOTIFY_EVENT, (event) => {
      const parsed = parseNotify(event.payload);

      if (parsed === null) {
        return;
      }

      useToastsStore.getState().push(parsed.kind, parsed.title, parsed.body);
    });

    return () => {
      void subscription.then((unlisten) => {
        unlisten();
      });
    };
  }, []);

  return (
    <div className="pointer-events-none fixed top-[calc(var(--titlebar-height)+12px)] right-4 z-[100] flex flex-col gap-2">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  );
}
