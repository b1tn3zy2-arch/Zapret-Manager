// Импортируем зависимости из модуля @/i18n.
import { useI18n } from "@/i18n";
// Импортируем зависимости из модуля react.
import { useEffect, useId, useRef, type ReactNode } from "react";
// Импортируем зависимости из модуля react-dom.
import { createPortal } from "react-dom";
// Импортируем зависимости из модуля framer-motion.
import { AnimatePresence, motion } from "framer-motion";
// Импортируем зависимости из модуля lucide-react.
import { X } from "lucide-react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/lib/utils.
import { cn } from "@/lib/utils";
// Импортируем зависимости из модуля @/lib/constants.
import {
  // Подключаем именованный импорт MODAL_BACKDROP_BLUR_PX.
  MODAL_BACKDROP_BLUR_PX,
  // Подключаем именованный импорт MODAL_BACKDROP_SATURATE.
  MODAL_BACKDROP_SATURATE,
  // Закрываем текущий блок.
} from "@/lib/constants";
// — разделитель логических блоков —

// Импортируем зависимости из модуля ./types.
import type { ModalSize } from "./types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface ModalProps {
  // Обрабатываем конструкцию: open.
  open: boolean;
  // Обрабатываем конструкцию: onClose.
  onClose: () => void;
  // Обрабатываем конструкцию: title.
  title?: string;
  // Обрабатываем конструкцию: description.
  description?: string;
  // Обрабатываем конструкцию: size.
  size?: ModalSize;
  // Обрабатываем конструкцию: closeOnBackdrop.
  closeOnBackdrop?: boolean;
  // Обрабатываем конструкцию: closeOnEscape.
  closeOnEscape?: boolean;
  // Обрабатываем конструкцию: showCloseButton.
  showCloseButton?: boolean;
  // Обрабатываем конструкцию: footer.
  footer?: ReactNode;
  // Обрабатываем конструкцию: className.
  className?: string;
  // Обрабатываем конструкцию: children.
  children: ReactNode;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: const WIDTH_CLASSES = { sm: max-w-[var(--modal-width-sm….
const WIDTH_CLASSES = {
  // Обрабатываем конструкцию: sm.
  sm: "max-w-[var(--modal-width-sm)]",
  // Обрабатываем конструкцию: md.
  md: "max-w-[var(--modal-width-md)]",
  // Обрабатываем конструкцию: lg.
  lg: "max-w-[var(--modal-width-lg)]",
  // Обрабатываем конструкцию: xl.
  xl: "max-w-[var(--modal-width-xl)]",
  // Закрываем текущий блок.
} as const satisfies Record<ModalSize, string>;
// — разделитель логических блоков —

// Обрабатываем конструкцию: const FOCUSABLE_SELECTOR = [ a[href], button:not([disab….
const FOCUSABLE_SELECTOR = [
  // Обрабатываем конструкцию: a[href].
  "a[href]",
  // Обрабатываем конструкцию: button:not([disabled]).
  "button:not([disabled])",
  // Обрабатываем конструкцию: input:not([disabled]).
  "input:not([disabled])",
  // Обрабатываем конструкцию: select:not([disabled]).
  "select:not([disabled])",
  // Обрабатываем конструкцию: textarea:not([disabled]).
  "textarea:not([disabled])",
  // Обрабатываем конструкцию: [tabindex]:not([tabindex=-1]).
  '[tabindex]:not([tabindex="-1"])',
  // Закрываем массив или список.
].join(",");
// — разделитель логических блоков —

// Обрабатываем конструкцию: const PANEL_TRANSITION = { duration: 0.25, ease: [0.16,….
const PANEL_TRANSITION = { duration: 0.25, ease: [0.16, 1, 0.3, 1] } as const;
// — разделитель логических блоков —

// Объявляем функцию getFocusable.
function getFocusable(container: HTMLElement): HTMLElement[] {
  // Возвращаем результат: Array.from( container.querySelectorAll<HTMLElement>(FOC….
  return Array.from(
    // Обрабатываем конструкцию: container.
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export default function Modal({
  // Обрабатываем конструкцию: open.
  open,
  // Обрабатываем конструкцию: onClose.
  onClose,
  // Обрабатываем конструкцию: title.
  title,
  // Обрабатываем конструкцию: description.
  description,
  // Обрабатываем конструкцию: size.
  size = "md",
  // Обрабатываем конструкцию: closeOnBackdrop.
  closeOnBackdrop = true,
  // Обрабатываем конструкцию: closeOnEscape.
  closeOnEscape = true,
  // Обрабатываем конструкцию: showCloseButton.
  showCloseButton = true,
  // Обрабатываем конструкцию: footer.
  footer,
  // Обрабатываем конструкцию: className.
  className,
  // Обрабатываем конструкцию: children.
  children,
  // Закрываем текущий блок.
}: ModalProps) {
  // Обрабатываем конструкцию: const { t } = useI18n().
  const { t } = useI18n();
  // Обрабатываем конструкцию: const panelRef = useRef<HTMLDivElement>(null).
  const panelRef = useRef<HTMLDivElement>(null);
  // Обрабатываем конструкцию: const restoreFocusRef = useRef<HTMLElement | null>(null….
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  // Обрабатываем конструкцию: const titleId = useId().
  const titleId = useId();
  // Обрабатываем конструкцию: const descriptionId = useId().
  const descriptionId = useId();
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: useEffect.
  useEffect(() => {
    // Проверяем бизнес-условие: !open.
    if (!open) {
      // Завершаем функцию без возвращаемого значения.
      return;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: restoreFocusRef.
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const panel = panelRef.current.
    const panel = panelRef.current;
    // Проверяем бизнес-условие: panel !== null.
    if (panel !== null) {
      // Сохраняем пояснение разработчика: // Сначала поле ввода, а не крестик: в формах пользователь о…
      // Сначала поле ввода, а не крестик: в формах пользователь ожидает
      // Сохраняем пояснение разработчика: // курсор в первом поле, а закрытие всегда доступно по Escap…
      // курсор в первом поле, а закрытие всегда доступно по Escape.
      // Обрабатываем конструкцию: const field = panel.querySelector<HTMLElement>( input:n….
      const field = panel.querySelector<HTMLElement>(
        // Обрабатываем конструкцию: input:not([disabled]), textarea:not([disabled]), select….
        "input:not([disabled]), textarea:not([disabled]), select:not([disabled])"
        // Закрываем выражение или список аргументов.
      );
      // Обрабатываем конструкцию: const [first] = getFocusable(panel).
      const [first] = getFocusable(panel);
      // Обрабатываем конструкцию: (field ?? first ?? panel).
      (field ?? first ?? panel).focus();
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Возвращаем результат: () => { restoreFocusRef.current?.focus(); restoreFocusR….
    return () => {
      // Обрабатываем конструкцию: restoreFocusRef.
      restoreFocusRef.current?.focus();
      // Обрабатываем конструкцию: restoreFocusRef.
      restoreFocusRef.current = null;
      // Закрываем текущий блок.
    };
    // Закрываем текущий блок.
  }, [open]);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: useEffect.
  useEffect(() => {
    // Проверяем бизнес-условие: !open.
    if (!open) {
      // Завершаем функцию без возвращаемого значения.
      return;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const handleKeyDown = (event: KeyboardEvent) => { if (e….
    const handleKeyDown = (event: KeyboardEvent) => {
      // Проверяем бизнес-условие: event.key === Escape && closeOnEscape.
      if (event.key === "Escape" && closeOnEscape) {
        // Обрабатываем конструкцию: event.
        event.preventDefault();
        // Обрабатываем конструкцию: onClose.
        onClose();
        // Завершаем функцию без возвращаемого значения.
        return;
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Проверяем бизнес-условие: event.key !== Tab.
      if (event.key !== "Tab") {
        // Завершаем функцию без возвращаемого значения.
        return;
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: const panel = panelRef.current.
      const panel = panelRef.current;
      // Проверяем бизнес-условие: panel === null.
      if (panel === null) {
        // Завершаем функцию без возвращаемого значения.
        return;
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: const focusable = getFocusable(panel).
      const focusable = getFocusable(panel);
      // Проверяем бизнес-условие: focusable.length === 0.
      if (focusable.length === 0) {
        // Обрабатываем конструкцию: event.
        event.preventDefault();
        // Завершаем функцию без возвращаемого значения.
        return;
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: const first = focusable[0].
      const first = focusable[0];
      // Обрабатываем конструкцию: const last = focusable[focusable.length - 1].
      const last = focusable[focusable.length - 1];
      // Проверяем бизнес-условие: first === undefined || last === undefined.
      if (first === undefined || last === undefined) {
        // Завершаем функцию без возвращаемого значения.
        return;
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: const active = document.activeElement.
      const active = document.activeElement;
      // Сохраняем пояснение разработчика: // Фокус мог уйти за пределы панели (клик по фону, программн…
      // Фокус мог уйти за пределы панели (клик по фону, программный
      // Сохраняем пояснение разработчика: // фокус): возвращаем его внутрь, иначе Tab ходит по страниц…
      // фокус): возвращаем его внутрь, иначе Tab ходит по странице.
      // Проверяем бизнес-условие: active === null || !panel.contains(active).
      if (active === null || !panel.contains(active)) {
        // Обрабатываем конструкцию: event.
        event.preventDefault();
        // Обрабатываем конструкцию: (event.shiftKey ? last : first).
        (event.shiftKey ? last : first).focus();
        // Завершаем функцию без возвращаемого значения.
        return;
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Проверяем бизнес-условие: event.shiftKey && (active === first || active === panel….
      if (event.shiftKey && (active === first || active === panel)) {
        // Обрабатываем конструкцию: event.
        event.preventDefault();
        // Обрабатываем конструкцию: last.
        last.focus();
        // Завершаем функцию без возвращаемого значения.
        return;
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Проверяем бизнес-условие: !event.shiftKey && active === last.
      if (!event.shiftKey && active === last) {
        // Обрабатываем конструкцию: event.
        event.preventDefault();
        // Обрабатываем конструкцию: first.
        first.focus();
        // Закрываем текущий блок.
      }
      // Закрываем текущий блок.
    };
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: document.
    document.addEventListener("keydown", handleKeyDown);
    // Возвращаем результат: () => { document.removeEventListener(keydown, handleKey….
    return () => {
      // Обрабатываем конструкцию: document.
      document.removeEventListener("keydown", handleKeyDown);
      // Закрываем текущий блок.
    };
    // Закрываем текущий блок.
  }, [open, closeOnEscape, onClose]);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const hasTitle = title !== undefined.
  const hasTitle = title !== undefined;
  // Обрабатываем конструкцию: const hasDescription = description !== undefined.
  const hasDescription = description !== undefined;
  // Обрабатываем конструкцию: const hasHeader = (hasTitle || hasDescription) && showC….
  const hasHeader = (hasTitle || hasDescription) && showCloseButton;
  // — разделитель логических блоков —

  // Возвращаем результат: createPortal( <AnimatePresence> {open ? ( <div classNam….
  return createPortal(
    // Обрабатываем конструкцию: <AnimatePresence>.
    <AnimatePresence>
      {/* Выводим текстовое содержимое в JSX. */}
      {open ? (
        // Обрабатываем конструкцию: <div className=fixed inset-0 z-50 flex items-center jus….
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          {/* Выводим текстовое содержимое в JSX. */}
          <motion.div
            // Обрабатываем конструкцию: key.
            key="backdrop"
            // Обрабатываем конструкцию: initial.
            initial={{ opacity: 0 }}
            // Обрабатываем конструкцию: animate.
            animate={{ opacity: 1 }}
            // Обрабатываем конструкцию: exit.
            exit={{ opacity: 0 }}
            // Обрабатываем конструкцию: transition.
            transition={{ duration: 0.2, ease: "easeOut" }}
            // Обрабатываем конструкцию: onClick.
            onClick={closeOnBackdrop ? onClose : undefined}
            // Обрабатываем конструкцию: style.
            style={{
              // Обрабатываем конструкцию: backdropFilter.
              backdropFilter: `blur(${MODAL_BACKDROP_BLUR_PX}px) saturate(${MODAL_BACKDROP_SATURATE})`,
              // Закрываем текущий блок.
            }}
            // Обрабатываем конструкцию: className.
            className="bg-bg-primary/60 absolute inset-0"
            // Продолжаем выражение.
          />
          {/* — разделитель логических блоков — */}

          {/* Выводим текстовое содержимое в JSX. */}
          <motion.div
            // Обрабатываем конструкцию: key.
            key="panel"
            // Обрабатываем конструкцию: ref.
            ref={panelRef}
            // Обрабатываем конструкцию: role.
            role="dialog"
            // Обрабатываем конструкцию: aria-modal.
            aria-modal="true"
            // Обрабатываем конструкцию: tabIndex.
            tabIndex={-1}
            // Обрабатываем конструкцию: aria-labelledby.
            aria-labelledby={hasTitle ? titleId : undefined}
            // Обрабатываем конструкцию: aria-describedby.
            aria-describedby={hasDescription ? descriptionId : undefined}
            // Обрабатываем конструкцию: initial.
            initial={{ opacity: 0, scale: 0.95 }}
            // Обрабатываем конструкцию: animate.
            animate={{ opacity: 1, scale: 1 }}
            // Обрабатываем конструкцию: exit.
            exit={{ opacity: 0, scale: 0.95 }}
            // Обрабатываем конструкцию: transition.
            transition={PANEL_TRANSITION}
            // Обрабатываем конструкцию: className.
            className={cn(
              // Обрабатываем конструкцию: relative flex max-h-[85vh] w-full flex-col gap-4 overfl….
              "relative flex max-h-[85vh] w-full flex-col gap-4 overflow-y-auto overscroll-contain",
              // Обрабатываем конструкцию: bg-bg-secondary/95 border-glass-border rounded-2xl bord….
              "bg-bg-secondary/95 border-glass-border rounded-2xl border p-6",
              // Обрабатываем конструкцию: shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl o….
              "shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl outline-none",
              // Обрабатываем конструкцию: WIDTH_CLASSES.
              WIDTH_CLASSES[size],
              // Обрабатываем конструкцию: className.
              className
              // Закрываем выражение или список аргументов.
            )}
            // Продолжаем выражение.
          >
            {/* Выводим текстовое содержимое в JSX. */}
            {hasHeader ? (
              // Обрабатываем конструкцию: <div className=flex items-start justify-between gap-4>.
              <div className="flex items-start justify-between gap-4">
                {/* Выводим текстовое содержимое в JSX. */}
                <div className="flex flex-col gap-1">
                  {/* Выводим текстовое содержимое в JSX. */}
                  {hasTitle ? (
                    // Обрабатываем конструкцию: <h2 id={titleId} className=text-text-primary text-lg fo….
                    <h2
                      // Обрабатываем конструкцию: id.
                      id={titleId}
                      // Обрабатываем конструкцию: className.
                      className="text-text-primary text-lg font-semibold"
                      // Продолжаем выражение.
                    >
                      {/* Выводим текстовое содержимое в JSX. */}
                      {title}
                      {/* Выводим текстовое содержимое в JSX. */}
                    </h2>
                  ) : // Закрываем выражение или список аргументов.
                  // Продолжаем предыдущую конструкцию.
                  null}
                  {/* Выводим текстовое содержимое в JSX. */}
                  {hasDescription ? (
                    // Обрабатываем конструкцию: <p id={descriptionId} className=text-text-secondary tex….
                    <p
                      // Обрабатываем конструкцию: id.
                      id={descriptionId}
                      // Обрабатываем конструкцию: className.
                      className="text-text-secondary text-sm"
                      // Продолжаем выражение.
                    >
                      {/* Выводим текстовое содержимое в JSX. */}
                      {description}
                      {/* Выводим текстовое содержимое в JSX. */}
                    </p>
                  ) : // Закрываем выражение или список аргументов.
                  // Продолжаем предыдущую конструкцию.
                  null}
                  {/* Выводим текстовое содержимое в JSX. */}
                </div>
                {/* — разделитель логических блоков — */}

                {/* Выводим текстовое содержимое в JSX. */}
                <button
                  // Обрабатываем конструкцию: type.
                  type="button"
                  // Обрабатываем конструкцию: onClick.
                  onClick={onClose}
                  // Обрабатываем конструкцию: aria-label.
                  aria-label={t("ui.closeAria")}
                  // Обрабатываем конструкцию: className.
                  className={cn(
                    // Обрабатываем конструкцию: inline-flex size-8 shrink-0 items-center justify-center….
                    "inline-flex size-8 shrink-0 items-center justify-center rounded-lg",
                    // Обрабатываем конструкцию: text-text-secondary transition-colors duration-200 ease….
                    "text-text-secondary transition-colors duration-200 ease-out",
                    // Обрабатываем конструкцию: hover:text-text-primary hover:bg-glass-hover.
                    "hover:text-text-primary hover:bg-glass-hover"
                    // Закрываем выражение или список аргументов.
                  )}
                  // Продолжаем выражение.
                >
                  {/* Выводим текстовое содержимое в JSX. */}
                  <X aria-hidden="true" className="size-4" strokeWidth={2} />
                  {/* Выводим текстовое содержимое в JSX. */}
                </button>
                {/* Выводим текстовое содержимое в JSX. */}
              </div>
            ) : // Закрываем выражение или список аргументов.
            // Продолжаем предыдущую конструкцию.
            null}
            {/* — разделитель логических блоков — */}

            {/* Выводим текстовое содержимое в JSX. */}
            {hasTitle && !showCloseButton ? (
              // Обрабатываем конструкцию: <div className=flex flex-col gap-1>.
              <div className="flex flex-col gap-1">
                {/* Выводим текстовое содержимое в JSX. */}
                <h2
                  // Обрабатываем конструкцию: id.
                  id={titleId}
                  // Обрабатываем конструкцию: className.
                  className="text-text-primary text-lg font-semibold"
                  // Продолжаем выражение.
                >
                  {/* Выводим текстовое содержимое в JSX. */}
                  {title}
                  {/* Выводим текстовое содержимое в JSX. */}
                </h2>
                {/* Выводим текстовое содержимое в JSX. */}
                {hasDescription ? (
                  // Обрабатываем конструкцию: <p id={descriptionId} className=text-text-secondary tex….
                  <p id={descriptionId} className="text-text-secondary text-sm">
                    {/* Выводим текстовое содержимое в JSX. */}
                    {description}
                    {/* Выводим текстовое содержимое в JSX. */}
                  </p>
                ) : // Закрываем выражение или список аргументов.
                // Продолжаем предыдущую конструкцию.
                null}
                {/* Выводим текстовое содержимое в JSX. */}
              </div>
            ) : // Закрываем выражение или список аргументов.
            // Продолжаем предыдущую конструкцию.
            null}
            {/* — разделитель логических блоков — */}

            {/* Выводим текстовое содержимое в JSX. */}
            <div className="min-h-0 flex-1 scrollbar-thin overflow-y-auto">
              {/* Выводим текстовое содержимое в JSX. */}
              {children}
              {/* Выводим текстовое содержимое в JSX. */}
            </div>
            {/* — разделитель логических блоков — */}

            {/* Выводим текстовое содержимое в JSX. */}
            {footer !== undefined ? (
              // Обрабатываем конструкцию: <div className=border-glass-border flex justify-end gap….
              <div className="border-glass-border flex justify-end gap-2 border-t pt-4">
                {/* Выводим текстовое содержимое в JSX. */}
                {footer}
                {/* Выводим текстовое содержимое в JSX. */}
              </div>
            ) : // Закрываем выражение или список аргументов.
            // Продолжаем предыдущую конструкцию.
            null}
            {/* Выводим текстовое содержимое в JSX. */}
          </motion.div>
          {/* Выводим текстовое содержимое в JSX. */}
        </div>
      ) : // Закрываем выражение или список аргументов.
      // Продолжаем предыдущую конструкцию.
      null}
      {/* Выводим текстовое содержимое в JSX. */}
    </AnimatePresence>,
    // Обрабатываем конструкцию: document.
    document.body
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
