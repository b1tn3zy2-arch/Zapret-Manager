// Импортируем зависимости из модуля @tauri-apps/api/event.
import { listen } from "@tauri-apps/api/event";
// Импортируем зависимости из модуля react.
import { useEffect } from "react";
// Импортируем зависимости из модуля framer-motion.
import { AnimatePresence, motion } from "framer-motion";
// Импортируем зависимости из модуля lucide-react.
import { AlertCircle, Check, Info, TriangleAlert, X } from "lucide-react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/i18n.
import { useI18n } from "@/i18n";
// Импортируем зависимости из модуля @/lib/constants.
import { NOTIFY_EVENT } from "@/lib/constants";
// Импортируем зависимости из модуля @/lib/notifySound.
import {
  // Подключаем именованный импорт playNotificationSound.
  playNotificationSound,
  // Подключаем именованный импорт preloadNotificationSounds.
  preloadNotificationSounds,
  // Подключаем именованный импорт unlockNotificationSound.
  unlockNotificationSound,
  // Закрываем текущий блок.
} from "@/lib/notifySound";
// Импортируем зависимости из модуля @/lib/notifyProtocol.
import { parseNotify } from "@/lib/notifyProtocol";
// Импортируем зависимости из модуля @/stores/useSettingsStore.
import { useSettingsStore } from "@/stores/useSettingsStore";
// Импортируем зависимости из модуля @/lib/utils.
import { cn } from "@/lib/utils";
// Импортируем зависимости из модуля @/stores/useToastsStore.
import {
  // Подключаем именованный импорт TOAST_TTL_MS.
  TOAST_TTL_MS,
  // Подключаем именованный импорт useToastsStore.
  useToastsStore,
  // Подключаем именованный импорт type AppToast.
  type AppToast,
  // Закрываем текущий блок.
} from "@/stores/useToastsStore";
// Импортируем зависимости из модуля @/types.
import type { NotificationKind } from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: const KIND_STYLES: Record<NotificationKind, string> = {….
const KIND_STYLES: Record<NotificationKind, string> = {
  // Обрабатываем конструкцию: success.
  success: "border-accent-primary/40 text-accent-primary",
  // Обрабатываем конструкцию: error.
  error: "border-accent-danger/40 text-accent-danger",
  // Обрабатываем конструкцию: warning.
  warning: "border-accent-warning/40 text-accent-warning",
  // Обрабатываем конструкцию: info.
  info: "border-glass-border text-text-primary",
  // Закрываем текущий блок.
};
// — разделитель логических блоков —

// Обрабатываем конструкцию: const KIND_ICONS = { success: Check, error: AlertCircle….
const KIND_ICONS = {
  // Обрабатываем конструкцию: success.
  success: Check,
  // Обрабатываем конструкцию: error.
  error: AlertCircle,
  // Обрабатываем конструкцию: warning.
  warning: TriangleAlert,
  // Обрабатываем конструкцию: info.
  info: Info,
  // Закрываем текущий блок.
} as const satisfies Record<NotificationKind, typeof Check>;
// — разделитель логических блоков —

// Объявляем функцию ToastCard.
function ToastCard({ toast }: { toast: AppToast }) {
  // Обрабатываем конструкцию: const { t } = useI18n().
  const { t } = useI18n();
  // Обрабатываем конструкцию: const dismiss = useToastsStore((state) => state.dismiss….
  const dismiss = useToastsStore((state) => state.dismiss);
  // Обрабатываем конструкцию: const Icon = KIND_ICONS[toast.kind].
  const Icon = KIND_ICONS[toast.kind];
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: useEffect.
  useEffect(() => {
    // Обрабатываем конструкцию: const timer = window.setTimeout(() => { dismiss(toast.i….
    const timer = window.setTimeout(() => {
      // Обрабатываем конструкцию: dismiss.
      dismiss(toast.id);
      // Закрываем текущий блок.
    }, TOAST_TTL_MS);
    // — разделитель логических блоков —

    // Возвращаем результат: () => { window.clearTimeout(timer); }.
    return () => {
      // Обрабатываем конструкцию: window.
      window.clearTimeout(timer);
      // Закрываем текущий блок.
    };
    // Закрываем текущий блок.
  }, [dismiss, toast.id]);
  // — разделитель логических блоков —

  // Возвращаем результат: ( <motion.div layout role=status aria-live=polite initi….
  return (
    // Обрабатываем конструкцию: <motion.div layout role=status aria-live=polite initial….
    <motion.div
      // Задаём атрибут layout элемента.
      layout
      // Обрабатываем конструкцию: role.
      role="status"
      // Обрабатываем конструкцию: aria-live.
      aria-live="polite"
      // Обрабатываем конструкцию: initial.
      initial={{ opacity: 0, x: 48, scale: 0.9, filter: "blur(6px)" }}
      // Обрабатываем конструкцию: animate.
      animate={{ opacity: 1, x: 0, scale: 1, filter: "blur(0px)" }}
      // Обрабатываем конструкцию: exit.
      exit={{ opacity: 0, x: 48, scale: 0.94, filter: "blur(4px)" }}
      // Обрабатываем конструкцию: transition.
      transition={{ type: "spring", stiffness: 380, damping: 32, mass: 0.9 }}
      // Обрабатываем конструкцию: className.
      className={cn(
        // Обрабатываем конструкцию: bg-bg-secondary/95 pointer-events-auto flex w-[320px] i….
        "bg-bg-secondary/95 pointer-events-auto flex w-[320px] items-start gap-2.5",
        // Обрабатываем конструкцию: rounded-xl border p-3 shadow-2xl backdrop-blur-xl.
        "rounded-xl border p-3 shadow-2xl backdrop-blur-xl",
        // Обрабатываем конструкцию: KIND_STYLES.
        KIND_STYLES[toast.kind]
        // Закрываем выражение или список аргументов.
      )}
      // Продолжаем выражение.
    >
      {/* Выводим текстовое содержимое в JSX. */}
      <Icon
        // Обрабатываем конструкцию: aria-hidden.
        aria-hidden="true"
        // Обрабатываем конструкцию: className.
        className="mt-0.5 size-4 shrink-0"
        // Обрабатываем конструкцию: strokeWidth.
        strokeWidth={2}
        // Продолжаем выражение.
      />
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        {/* Выводим текстовое содержимое в JSX. */}
        <span className="text-text-primary truncate text-sm font-semibold">
          {/* Выводим текстовое содержимое в JSX. */}
          {toast.title}
          {/* Выводим текстовое содержимое в JSX. */}
        </span>
        {/* Выводим текстовое содержимое в JSX. */}
        {toast.body === "" ? null : (
          // Обрабатываем конструкцию: <span className=text-text-secondary text-xs break-words….
          <span className="text-text-secondary text-xs break-words">
            {/* Выводим текстовое содержимое в JSX. */}
            {toast.body}
            {/* Выводим текстовое содержимое в JSX. */}
          </span>
          // Закрываем выражение или список аргументов.
        )}
        {/* Выводим текстовое содержимое в JSX. */}
      </div>
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <button
        // Обрабатываем конструкцию: type.
        type="button"
        // Обрабатываем конструкцию: aria-label.
        aria-label={t("common.close")}
        // Обрабатываем конструкцию: onClick.
        onClick={() => {
          // Обрабатываем конструкцию: dismiss.
          dismiss(toast.id);
          // Закрываем текущий блок.
        }}
        // Обрабатываем конструкцию: className.
        className="text-text-tertiary hover:text-text-primary shrink-0 rounded p-0.5 transition-colors"
        // Продолжаем выражение.
      >
        {/* Выводим текстовое содержимое в JSX. */}
        <X aria-hidden="true" className="size-3.5" />
        {/* Выводим текстовое содержимое в JSX. */}
      </button>
      {/* Выводим текстовое содержимое в JSX. */}
    </motion.div>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export default function NotificationToaster() {
  // Обрабатываем конструкцию: const toasts = useToastsStore((state) => state.toasts).
  const toasts = useToastsStore((state) => state.toasts);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: useEffect.
  useEffect(() => {
    // Обрабатываем конструкцию: void preloadNotificationSounds().
    void preloadNotificationSounds();
    // Закрываем текущий блок.
  }, []);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: useEffect.
  useEffect(() => {
    // Обрабатываем конструкцию: const unlock = (): void => { unlockNotificationSound();….
    const unlock = (): void => {
      // Обрабатываем конструкцию: unlockNotificationSound.
      unlockNotificationSound();
      // Закрываем текущий блок.
    };
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: window.
    window.addEventListener("pointerdown", unlock, { once: true });
    // Обрабатываем конструкцию: window.
    window.addEventListener("keydown", unlock, { once: true });
    // — разделитель логических блоков —

    // Возвращаем результат: () => { window.removeEventListener(pointerdown, unlock)….
    return () => {
      // Обрабатываем конструкцию: window.
      window.removeEventListener("pointerdown", unlock);
      // Обрабатываем конструкцию: window.
      window.removeEventListener("keydown", unlock);
      // Закрываем текущий блок.
    };
    // Закрываем текущий блок.
  }, []);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: useEffect.
  useEffect(() => {
    // Обрабатываем конструкцию: const subscription = listen<string>(NOTIFY_EVENT, (even….
    const subscription = listen<string>(NOTIFY_EVENT, (event) => {
      // Обрабатываем конструкцию: const parsed = parseNotify(event.payload).
      const parsed = parseNotify(event.payload);
      // — разделитель логических блоков —

      // Проверяем бизнес-условие: parsed === null.
      if (parsed === null) {
        // Завершаем функцию без возвращаемого значения.
        return;
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Сохраняем пояснение разработчика: // Канал «Windows»: системное уведомление ушло из Rust, звук…
      // Канал «Windows»: системное уведомление ушло из Rust, звук играет
      // Сохраняем пояснение разработчика: // Windows, тостер интерфейса лишний.
      // Windows, тостер интерфейса лишний.
      // Обрабатываем конструкцию: const channel = useSettingsStore.getState().settings.ge….
      const channel =
        // Обрабатываем конструкцию: useSettingsStore.
        useSettingsStore.getState().settings.general.notificationChannel;
      // — разделитель логических блоков —

      // Проверяем бизнес-условие: channel === windows.
      if (channel === "windows") {
        // Завершаем функцию без возвращаемого значения.
        return;
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: playNotificationSound.
      playNotificationSound(parsed.kind);
      // Обрабатываем конструкцию: useToastsStore.
      useToastsStore.getState().push(parsed.kind, parsed.title, parsed.body);
      // Закрываем текущий блок.
    });
    // — разделитель логических блоков —

    // Возвращаем результат: () => { void subscription.then((unlisten) => { unlisten….
    return () => {
      // Обрабатываем конструкцию: void subscription.then((unlisten) => { unlisten(); }).
      void subscription.then((unlisten) => {
        // Обрабатываем конструкцию: unlisten.
        unlisten();
        // Закрываем текущий блок.
      });
      // Закрываем текущий блок.
    };
    // Закрываем текущий блок.
  }, []);
  // — разделитель логических блоков —

  // Возвращаем результат: ( <div className=pointer-events-none fixed top-[calc(va….
  return (
    // Обрабатываем конструкцию: <div className=pointer-events-none fixed top-[calc(var(….
    <div className="pointer-events-none fixed top-[calc(var(--titlebar-height)+12px)] right-4 z-[100] flex flex-col gap-2">
      {/* Выводим текстовое содержимое в JSX. */}
      <AnimatePresence initial={false} mode="popLayout">
        {/* Выводим текстовое содержимое в JSX. */}
        {toasts.map((toast) => (
          // Рендерим самозакрывающийся элемент ToastCard.
          <ToastCard key={toast.id} toast={toast} />
          // Закрываем выражение или список аргументов.
        ))}
        {/* Выводим текстовое содержимое в JSX. */}
      </AnimatePresence>
      {/* Выводим текстовое содержимое в JSX. */}
    </div>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
