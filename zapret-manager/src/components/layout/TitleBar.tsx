// Импортируем зависимости из модуля react.
import { useCallback, useEffect, useState } from "react";
// Импортируем зависимости из модуля @tauri-apps/api/event.
import type { UnlistenFn } from "@tauri-apps/api/event";
// Импортируем зависимости из модуля @tauri-apps/api/window.
import { getCurrentWindow } from "@tauri-apps/api/window";
// Импортируем зависимости из модуля lucide-react.
import { Copy, Minus, Shield, Square, X } from "lucide-react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/lib/constants.
import { APP_NAME, ROUTES } from "@/lib/constants";
// Импортируем зависимости из модуля @/lib/utils.
import { cn } from "@/lib/utils";
// Импортируем зависимости из модуля @/i18n.
import { useI18n } from "@/i18n";
// Импортируем зависимости из модуля @/stores/useAppStore.
import { useAppStore } from "@/stores/useAppStore";
// — разделитель логических блоков —

// Импортируем зависимости из модуля ./ModeBadge.
import ModeBadge from "./ModeBadge";
// — разделитель логических блоков —

// Обрабатываем конструкцию: const CONTROL_BUTTON_CLASS = flex size-8 shrink-0 items….
const CONTROL_BUTTON_CLASS =
  // Обрабатываем конструкцию: flex size-8 shrink-0 items-center justify-center rounde….
  "flex size-8 shrink-0 items-center justify-center rounded-md text-text-secondary " +
  // Обрабатываем конструкцию: transition-[background-color,color,transform] duration-….
  "transition-[background-color,color,transform] duration-200 ease-out " +
  // Обрабатываем конструкцию: hover:bg-glass-hover hover:text-text-primary hover:scal….
  "hover:bg-glass-hover hover:text-text-primary hover:scale-105 active:scale-90";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export default function TitleBar() {
  // Обрабатываем конструкцию: const [maximized, setMaximized] = useState(false).
  const [maximized, setMaximized] = useState(false);
  // Обрабатываем конструкцию: const setActivePage = useAppStore((state) => state.setA….
  const setActivePage = useAppStore((state) => state.setActivePage);
  // Обрабатываем конструкцию: const { t } = useI18n().
  const { t } = useI18n();
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: useEffect.
  useEffect(() => {
    // Обрабатываем конструкцию: const appWindow = getCurrentWindow().
    const appWindow = getCurrentWindow();
    // Обрабатываем конструкцию: let unlisten: UnlistenFn | undefined.
    let unlisten: UnlistenFn | undefined;
    // Обрабатываем конструкцию: let disposed = false.
    let disposed = false;
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const syncMaximized = () => { void appWindow.isMaximize….
    const syncMaximized = () => {
      // Обрабатываем конструкцию: void appWindow.isMaximized().then((value) => { if (!dis….
      void appWindow.isMaximized().then((value) => {
        // Проверяем бизнес-условие: !disposed.
        if (!disposed) {
          // Обрабатываем конструкцию: setMaximized.
          setMaximized(value);
          // Закрываем текущий блок.
        }
        // Закрываем текущий блок.
      });
      // Закрываем текущий блок.
    };
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: syncMaximized.
    syncMaximized();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: void appWindow.onResized(syncMaximized).then((stopListe….
    void appWindow.onResized(syncMaximized).then((stopListening) => {
      // Проверяем бизнес-условие: disposed.
      if (disposed) {
        // Обрабатываем конструкцию: stopListening.
        stopListening();
        // Завершаем функцию без возвращаемого значения.
        return;
        // Закрываем текущий блок.
      }
      // Обрабатываем конструкцию: unlisten.
      unlisten = stopListening;
      // Закрываем текущий блок.
    });
    // — разделитель логических блоков —

    // Возвращаем результат: () => { disposed = true; unlisten?.(); }.
    return () => {
      // Обрабатываем конструкцию: disposed.
      disposed = true;
      // Обрабатываем конструкцию: unlisten.
      unlisten?.();
      // Закрываем текущий блок.
    };
    // Закрываем текущий блок.
  }, []);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const minimize = useCallback(() => { void getCurrentWin….
  const minimize = useCallback(() => {
    // Обрабатываем конструкцию: void getCurrentWindow().minimize().
    void getCurrentWindow().minimize();
    // Закрываем текущий блок.
  }, []);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const toggleMaximize = useCallback(() => { void getCurr….
  const toggleMaximize = useCallback(() => {
    // Обрабатываем конструкцию: void getCurrentWindow().toggleMaximize().
    void getCurrentWindow().toggleMaximize();
    // Закрываем текущий блок.
  }, []);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const close = useCallback(() => { void getCurrentWindow….
  const close = useCallback(() => {
    // Обрабатываем конструкцию: void getCurrentWindow().close().
    void getCurrentWindow().close();
    // Закрываем текущий блок.
  }, []);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const MaximizeIcon = maximized ? Copy : Square.
  const MaximizeIcon = maximized ? Copy : Square;
  // — разделитель логических блоков —

  // Возвращаем результат: ( <header data-tauri-drag-region className=flex shrink-….
  return (
    // Обрабатываем конструкцию: <header data-tauri-drag-region className=flex shrink-0 ….
    <header
      // Задаём атрибут data-tauri-drag-region элемента.
      data-tauri-drag-region
      // Обрабатываем конструкцию: className.
      className="flex shrink-0 items-center justify-between"
      // Обрабатываем конструкцию: style.
      style={{ height: "var(--titlebar-height)" }}
      // Продолжаем выражение.
    >
      {/* Выводим текстовое содержимое в JSX. */}
      <div data-tauri-drag-region className="flex items-center gap-2 pr-2 pl-3">
        {/* Выводим текстовое содержимое в JSX. */}
        <Shield
          // Обрабатываем конструкцию: aria-hidden.
          aria-hidden="true"
          // Обрабатываем конструкцию: className.
          className="text-accent-primary size-5"
          // Обрабатываем конструкцию: strokeWidth.
          strokeWidth={2}
          // Продолжаем выражение.
        />
        {/* Выводим текстовое содержимое в JSX. */}
        <span
          // Задаём атрибут data-tauri-drag-region элемента.
          data-tauri-drag-region
          // Обрабатываем конструкцию: className.
          className="text-text-primary text-sm font-semibold tracking-tight"
          // Продолжаем выражение.
        >
          {/* Выводим текстовое содержимое в JSX. */}
          {APP_NAME}
          {/* Выводим текстовое содержимое в JSX. */}
        </span>
        {/* Выводим текстовое содержимое в JSX. */}
      </div>
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <div data-tauri-drag-region className="h-full flex-1" />
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <div
        // Обрабатываем конструкцию: className.
        className={cn(
          // Обрабатываем конструкцию: flex h-full items-center gap-1 pr-1.
          "flex h-full items-center gap-1 pr-1",
          // Обрабатываем конструкцию: [-webkit-app-region:no-drag] [app-region:no-drag].
          "[-webkit-app-region:no-drag] [app-region:no-drag]"
          // Закрываем выражение или список аргументов.
        )}
        // Продолжаем выражение.
      >
        {/* Выводим текстовое содержимое в JSX. */}
        <ModeBadge
          // Обрабатываем конструкцию: onClick.
          onClick={() => {
            // Обрабатываем конструкцию: setActivePage.
            setActivePage(ROUTES.dashboard);
            // Закрываем текущий блок.
          }}
          // Продолжаем выражение.
        />
        {/* — разделитель логических блоков — */}

        {/* Выводим текстовое содержимое в JSX. */}
        <button
          // Обрабатываем конструкцию: type.
          type="button"
          // Обрабатываем конструкцию: onClick.
          onClick={minimize}
          // Обрабатываем конструкцию: aria-label.
          aria-label={t("titleBar.minimize")}
          // Обрабатываем конструкцию: className.
          className={CONTROL_BUTTON_CLASS}
          // Продолжаем выражение.
        >
          {/* Выводим текстовое содержимое в JSX. */}
          <Minus aria-hidden="true" className="size-4" strokeWidth={2} />
          {/* Выводим текстовое содержимое в JSX. */}
        </button>
        {/* Выводим текстовое содержимое в JSX. */}
        <button
          // Обрабатываем конструкцию: type.
          type="button"
          // Обрабатываем конструкцию: onClick.
          onClick={toggleMaximize}
          // Обрабатываем конструкцию: aria-label.
          aria-label={
            // Обрабатываем конструкцию: maximized.
            maximized ? t("titleBar.restore") : t("titleBar.maximize")
            // Закрываем текущий блок.
          }
          // Обрабатываем конструкцию: className.
          className={CONTROL_BUTTON_CLASS}
          // Продолжаем выражение.
        >
          {/* Выводим текстовое содержимое в JSX. */}
          <MaximizeIcon aria-hidden="true" className="size-4" strokeWidth={2} />
          {/* Выводим текстовое содержимое в JSX. */}
        </button>
        {/* Выводим текстовое содержимое в JSX. */}
        <button
          // Обрабатываем конструкцию: type.
          type="button"
          // Обрабатываем конструкцию: onClick.
          onClick={close}
          // Обрабатываем конструкцию: aria-label.
          aria-label={t("titleBar.close")}
          // Обрабатываем конструкцию: className.
          className={cn(
            // Обрабатываем конструкцию: CONTROL_BUTTON_CLASS.
            CONTROL_BUTTON_CLASS,
            // Обрабатываем конструкцию: hover:bg-accent-danger hover:text-white.
            "hover:bg-accent-danger hover:text-white"
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
      {/* Выводим текстовое содержимое в JSX. */}
    </header>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
