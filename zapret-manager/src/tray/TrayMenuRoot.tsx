// Импортируем зависимости из модуля @/lib/secureInvoke.
import { secureInvoke } from "@/lib/secureInvoke";
// Импортируем зависимости из модуля @tauri-apps/api/event.
import { listen } from "@tauri-apps/api/event";
// Импортируем зависимости из модуля react.
import { useCallback, useEffect, useRef, useState } from "react";
// Импортируем зависимости из модуля @tauri-apps/api/window.
import { getCurrentWindow } from "@tauri-apps/api/window";
// Импортируем зависимости из модуля lucide-react.
import {
  // Подключаем именованный импорт Info.
  Info,
  // Подключаем именованный импорт Layers.
  Layers,
  // Подключаем именованный импорт LayoutDashboard.
  LayoutDashboard,
  // Подключаем именованный импорт Lock.
  Lock,
  // Подключаем именованный импорт LogOut.
  LogOut,
  // Подключаем именованный импорт Play.
  Play,
  // Подключаем именованный импорт RefreshCw.
  RefreshCw,
  // Подключаем именованный импорт ScrollText.
  ScrollText,
  // Обрабатываем конструкцию: Settings.
  Settings as SettingsIcon,
  // Подключаем именованный импорт Square.
  Square,
  // Подключаем именованный импорт Unlock.
  Unlock,
  // Закрываем текущий блок.
} from "lucide-react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/components/ui.
import { Badge } from "@/components/ui";
// Импортируем зависимости из модуля @/i18n.
import { useI18n } from "@/i18n";
// Импортируем зависимости из модуля @/lib/utils.
import { cn } from "@/lib/utils";
// Импортируем зависимости из модуля @/styles/tray-menu.css.
import "@/styles/tray-menu.css";
// — разделитель логических блоков —

// Объявляем псевдоним типа MenuAction.
type MenuAction =
  // Обрабатываем конструкцию: | run | stop | vpn-connect | vpn-disconnect | dashboard….
  | "run"
  // Продолжаем выражение.
  | "stop"
  // Продолжаем выражение.
  | "vpn-connect"
  // Продолжаем выражение.
  | "vpn-disconnect"
  // Продолжаем выражение.
  | "dashboard"
  // Продолжаем выражение.
  | "strategies"
  // Продолжаем выражение.
  | "logs"
  // Продолжаем выражение.
  | "settings"
  // Продолжаем выражение.
  | "about"
  // Продолжаем выражение.
  | "updates"
  // Продолжаем выражение.
  | "quit";
// — разделитель логических блоков —

// Объявляем интерфейс TraySnapshot с контрактом данных.
interface TraySnapshot {
  // Обрабатываем конструкцию: state.
  state: string;
  // Обрабатываем конструкцию: activeStrategy.
  activeStrategy: string | null;
  // Обрабатываем конструкцию: vpnName.
  vpnName: string | null;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем интерфейс MenuRowProps с контрактом данных.
interface MenuRowProps {
  // Обрабатываем конструкцию: label.
  label: string;
  // Обрабатываем конструкцию: icon.
  icon: typeof Play;
  // Обрабатываем конструкцию: action.
  action: MenuAction;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию MenuRow.
function MenuRow({ label, icon: Icon, action }: MenuRowProps) {
  // Возвращаем результат: ( <button type=button onClick={() => { void secureInvok….
  return (
    // Обрабатываем конструкцию: <button type=button onClick={() => { void secureInvoke(….
    <button
      // Обрабатываем конструкцию: type.
      type="button"
      // Обрабатываем конструкцию: onClick.
      onClick={() => {
        // Обрабатываем конструкцию: void secureInvoke(tray_menu_action, { action }).
        void secureInvoke("tray_menu_action", { action });
        // Закрываем текущий блок.
      }}
      // Обрабатываем конструкцию: className.
      className={cn(
        // Обрабатываем конструкцию: group flex w-full items-center gap-2 rounded-md px-2 py….
        "group flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left",
        // Обрабатываем конструкцию: text-text-secondary hover:text-text-primary text-[13px].
        "text-text-secondary hover:text-text-primary text-[13px]",
        // Обрабатываем конструкцию: hover:bg-glass-hover transition-colors duration-100.
        "hover:bg-glass-hover transition-colors duration-100"
        // Закрываем выражение или список аргументов.
      )}
      // Продолжаем выражение.
    >
      {/* Выводим текстовое содержимое в JSX. */}
      <Icon
        // Обрабатываем конструкцию: aria-hidden.
        aria-hidden="true"
        // Обрабатываем конструкцию: className.
        className="text-text-tertiary group-hover:text-text-primary size-3.5 shrink-0"
        // Обрабатываем конструкцию: strokeWidth.
        strokeWidth={2}
        // Продолжаем выражение.
      />
      {/* Выводим текстовое содержимое в JSX. */}
      <span className="truncate">{label}</span>
      {/* Выводим текстовое содержимое в JSX. */}
    </button>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию Separator.
function Separator() {
  // Возвращаем результат: <div className=bg-glass-border my-1 h-px />.
  return <div className="bg-glass-border my-1 h-px" />;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export default function TrayMenuRoot() {
  // Обрабатываем конструкцию: const { t } = useI18n().
  const { t } = useI18n();
  // Обрабатываем конструкцию: const [snapshot, setSnapshot] = useState<TraySnapshot |….
  const [snapshot, setSnapshot] = useState<TraySnapshot | null>(null);
  // Обрабатываем конструкцию: const [corner, setCorner] = useState(top-right).
  const [corner, setCorner] = useState("top-right");
  // Обрабатываем конструкцию: const blurTimer = useRef<number | undefined>(undefined).
  const blurTimer = useRef<number | undefined>(undefined);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: useEffect.
  useEffect(() => {
    // Обрабатываем конструкцию: void secureInvoke(tray_menu_ready).catch(() => undefine….
    void secureInvoke("tray_menu_ready").catch(() => undefined);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const unlisteners: (() => void)[] = [].
    const unlisteners: (() => void)[] = [];
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: void listen<TraySnapshot>(tray-menu-open, (event) => { ….
    void listen<TraySnapshot>("tray-menu-open", (event) => {
      // Обрабатываем конструкцию: setSnapshot.
      setSnapshot(event.payload);
      // Закрываем текущий блок.
    }).then((stop) => {
      // Обрабатываем конструкцию: unlisteners.
      unlisteners.push(stop);
      // Закрываем текущий блок.
    });
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: void listen<string>(tray-menu-corner, (event) => { setC….
    void listen<string>("tray-menu-corner", (event) => {
      // Обрабатываем конструкцию: setCorner.
      setCorner(event.payload);
      // Закрываем текущий блок.
    }).then((stop) => {
      // Обрабатываем конструкцию: unlisteners.
      unlisteners.push(stop);
      // Закрываем текущий блок.
    });
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: void secureInvoke<TraySnapshot>(tray_menu_snapshot) .th….
    void secureInvoke<TraySnapshot>("tray_menu_snapshot")
      // Продолжаем цепочку вызовов.
      .then((value) => {
        // Обрабатываем конструкцию: setSnapshot.
        setSnapshot(value);
        // Закрываем текущий блок.
      })
      // Продолжаем цепочку вызовов.
      .catch(() => undefined);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const onKeyDown = (event: KeyboardEvent): void => { if ….
    const onKeyDown = (event: KeyboardEvent): void => {
      // Проверяем бизнес-условие: event.key === Escape.
      if (event.key === "Escape") {
        // Обрабатываем конструкцию: void secureInvoke(tray_menu_hide).catch(() => undefined….
        void secureInvoke("tray_menu_hide").catch(() => undefined);
        // Закрываем текущий блок.
      }
      // Закрываем текущий блок.
    };
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: document.
    document.addEventListener("keydown", onKeyDown);
    // — разделитель логических блоков —

    // Возвращаем результат: () => { document.removeEventListener(keydown, onKeyDown….
    return () => {
      // Обрабатываем конструкцию: document.
      document.removeEventListener("keydown", onKeyDown);
      // — разделитель логических блоков —

      // Перебираем элементы коллекции unlisteners.
      for (const stop of unlisteners) {
        // Обрабатываем конструкцию: stop.
        stop();
        // Закрываем текущий блок.
      }
      // Закрываем текущий блок.
    };
    // Закрываем текущий блок.
  }, []);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: useEffect.
  useEffect(() => {
    // Обрабатываем конструкцию: const appWindow = getCurrentWindow().
    const appWindow = getCurrentWindow();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: void appWindow .onFocusChanged((event) => { if (event.p….
    void appWindow
      // Продолжаем цепочку вызовов.
      .onFocusChanged((event) => {
        // Проверяем бизнес-условие: event.payload.
        if (event.payload) {
          // Проверяем бизнес-условие: blurTimer.current !== undefined.
          if (blurTimer.current !== undefined) {
            // Обрабатываем конструкцию: window.
            window.clearTimeout(blurTimer.current);
            // Обрабатываем конструкцию: blurTimer.
            blurTimer.current = undefined;
            // Закрываем текущий блок.
          }
          // — разделитель логических блоков —

          // Завершаем функцию без возвращаемого значения.
          return;
          // Закрываем текущий блок.
        }
        // — разделитель логических блоков —

        // Проверяем бизнес-условие: blurTimer.current !== undefined.
        if (blurTimer.current !== undefined) {
          // Завершаем функцию без возвращаемого значения.
          return;
          // Закрываем текущий блок.
        }
        // — разделитель логических блоков —

        // Обрабатываем конструкцию: blurTimer.
        blurTimer.current = window.setTimeout(() => {
          // Обрабатываем конструкцию: blurTimer.
          blurTimer.current = undefined;
          // Обрабатываем конструкцию: void secureInvoke(tray_menu_hide).catch(() => undefined….
          void secureInvoke("tray_menu_hide").catch(() => undefined);
          // Закрываем текущий блок.
        }, 50);
        // Закрываем текущий блок.
      })
      // Продолжаем цепочку вызовов.
      .then((stop) => stop());
    // — разделитель логических блоков —

    // Возвращаем результат: () => { if (blurTimer.current !== undefined) { window.c….
    return () => {
      // Проверяем бизнес-условие: blurTimer.current !== undefined.
      if (blurTimer.current !== undefined) {
        // Обрабатываем конструкцию: window.
        window.clearTimeout(blurTimer.current);
        // Закрываем текущий блок.
      }
      // Закрываем текущий блок.
    };
    // Закрываем текущий блок.
  }, []);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const isActive = snapshot?.state === connected || snaps….
  const isActive = snapshot?.state === "connected" || snapshot?.state === "vpn";
  // Обрабатываем конструкцию: const isVpn = snapshot?.state === vpn.
  const isVpn = snapshot?.state === "vpn";
  // Обрабатываем конструкцию: const subject = snapshot?.vpnName ?? snapshot?.activeSt….
  const subject = snapshot?.vpnName ?? snapshot?.activeStrategy ?? null;
  // Обрабатываем конструкцию: const vpnAction = useCallback((): void => { void secure….
  const vpnAction = useCallback((): void => {
    // Обрабатываем конструкцию: void secureInvoke(tray_menu_action, { action: isVpn ? v….
    void secureInvoke("tray_menu_action", {
      // Обрабатываем конструкцию: action.
      action: isVpn ? "vpn-disconnect" : "vpn-connect",
      // Закрываем текущий блок.
    });
    // Закрываем текущий блок.
  }, [isVpn]);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const frameRef = useRef<HTMLDivElement | null>(null).
  const frameRef = useRef<HTMLDivElement | null>(null);
  // Обрабатываем конструкцию: const shellRef = useRef<HTMLDivElement | null>(null).
  const shellRef = useRef<HTMLDivElement | null>(null);
  // — разделитель логических блоков —

  // Сохраняем пояснение разработчика: // Окно трея фиксированного размера, а пункт «Выход» находит…
  // Окно трея фиксированного размера, а пункт «Выход» находится в самом низу
  // Сохраняем пояснение разработчика: // списка. Без передачи реальной высоты контента он просто о…
  // списка. Без передачи реальной высоты контента он просто обрезался и не
  // Сохраняем пояснение разработчика: // нажимался.
  // нажимался.
  // Сохраняем пояснение разработчика: //
  //
  // Сохраняем пояснение разработчика: // Замер идёт через ResizeObserver, а не по rAF или useEffec…
  // Замер идёт через ResizeObserver, а не по rAF или useEffect: список меняется
  // Сохраняем пояснение разработчика: // асинхронно (статус стратегии, VPN-строка приходит событие…
  // асинхронно (статус стратегии, VPN-строка приходит событием трея), и замер
  // Сохраняем пояснение разработчика: // по кадрам успевал отставать на кадр — окно оставалось на …
  // по кадрам успевал отставать на кадр — окно оставалось на 8-23 px ниже
  // Сохраняем пояснение разработчика: // нужного, то есть «Выход» снова уходил под край.
  // нужного, то есть «Выход» снова уходил под край.
  // Обрабатываем конструкцию: useEffect.
  useEffect(() => {
    // Обрабатываем конструкцию: const frame = frameRef.current.
    const frame = frameRef.current;
    // Обрабатываем конструкцию: const shell = shellRef.current.
    const shell = shellRef.current;
    // — разделитель логических блоков —

    // Проверяем бизнес-условие: frame === null || shell === null.
    if (frame === null || shell === null) {
      // Завершаем функцию без возвращаемого значения.
      return;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const report = () => { const paddingBottom = Number.par….
    const report = () => {
      // Обрабатываем конструкцию: const paddingBottom = Number.parseFloat(getComputedStyl….
      const paddingBottom =
        // Обрабатываем конструкцию: Number.
        Number.parseFloat(getComputedStyle(frame).paddingBottom) || 0;
      // Обрабатываем конструкцию: const height = Math.ceil( shell.getBoundingClientRect()….
      const height = Math.ceil(
        // Обрабатываем конструкцию: shell.
        shell.getBoundingClientRect().bottom -
          // Обрабатываем конструкцию: frame.
          frame.getBoundingClientRect().top +
          // Обрабатываем конструкцию: paddingBottom.
          paddingBottom
        // Закрываем выражение или список аргументов.
      );
      // — разделитель логических блоков —

      // Проверяем бизнес-условие: height > 0.
      if (height > 0) {
        // Обрабатываем конструкцию: void secureInvoke(tray_menu_set_height, { height }).cat….
        void secureInvoke("tray_menu_set_height", { height }).catch(
          // Объявляем функцию-обработчик или стрелочную функцию.
          () => undefined
          // Закрываем выражение или список аргументов.
        );
        // Закрываем текущий блок.
      }
      // Закрываем текущий блок.
    };
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const observer = new ResizeObserver(report).
    const observer = new ResizeObserver(report);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: observer.
    observer.observe(shell);
    // Обрабатываем конструкцию: report.
    report();
    // — разделитель логических блоков —

    // Возвращаем результат: () => { observer.disconnect(); }.
    return () => {
      // Обрабатываем конструкцию: observer.
      observer.disconnect();
      // Закрываем текущий блок.
    };
    // Закрываем текущий блок.
  }, [snapshot, isActive, isVpn]);
  // — разделитель логических блоков —

  // Возвращаем результат: ( <> <div ref={frameRef} className=flex h-full w-full i….
  return (
    // Обрабатываем конструкцию: <>.
    <>
      {/* Выводим текстовое содержимое в JSX. */}
      <div ref={frameRef} className="flex h-full w-full items-start p-2">
        {/* Выводим текстовое содержимое в JSX. */}
        <div
          // Обрабатываем конструкцию: ref.
          ref={shellRef}
          // Обрабатываем конструкцию: data-corner.
          data-corner={corner}
          // Обрабатываем конструкцию: className.
          className={cn(
            // Обрабатываем конструкцию: tray-menu-shell border-glass-border bg-bg-secondary/98 ….
            "tray-menu-shell border-glass-border bg-bg-secondary/98 flex w-full flex-col",
            // Обрабатываем конструкцию: rounded-lg border p-1.5 shadow-2xl.
            "rounded-lg border p-1.5 shadow-2xl"
            // Закрываем выражение или список аргументов.
          )}
          // Продолжаем выражение.
        >
          {/* Выводим текстовое содержимое в JSX. */}
          <header className="flex items-center gap-2 px-2 py-1.5">
            {/* Выводим текстовое содержимое в JSX. */}
            <span
              // Обрабатываем конструкцию: aria-hidden.
              aria-hidden="true"
              // Обрабатываем конструкцию: className.
              className={cn(
                // Обрабатываем конструкцию: size-2 shrink-0 rounded-full.
                "size-2 shrink-0 rounded-full",
                // Обрабатываем конструкцию: isActive.
                isActive ? "bg-accent-success" : "bg-text-tertiary"
                // Закрываем выражение или список аргументов.
              )}
              // Продолжаем выражение.
            />
            {/* — разделитель логических блоков — */}

            {/* Выводим текстовое содержимое в JSX. */}
            <span className="text-text-primary min-w-0 flex-1 truncate text-xs font-semibold">
              {/* Выводим текстовое содержимое в JSX. */}
              Zapret
              {/* Обрабатываем конструкцию: </span>. */}
            </span>
            {/* — разделитель логических блоков — */}

            {/* Выводим текстовое содержимое в JSX. */}
            <Badge variant={isActive ? "success" : "neutral"} size="sm">
              {/* Выводим текстовое содержимое в JSX. */}
              {isActive
                ? // Обрабатываем конструкцию: ?.
                  // Продолжаем предыдущую конструкцию.
                  (subject ?? t("dashboard.tray.active"))
                : // Обрабатываем конструкцию: :.
                  // Продолжаем предыдущую конструкцию.
                  t("dashboard.tray.disconnected")}
              {/* Выводим текстовое содержимое в JSX. */}
            </Badge>
            {/* Выводим текстовое содержимое в JSX. */}
          </header>
          {/* — разделитель логических блоков — */}

          {/* Выводим текстовое содержимое в JSX. */}
          <Separator />
          {/* — разделитель логических блоков — */}

          {/* Выводим текстовое содержимое в JSX. */}
          <MenuRow label={t("dashboard.tray.run")} icon={Play} action="run" />
          {/* Выводим текстовое содержимое в JSX. */}
          <MenuRow
            // Обрабатываем конструкцию: label.
            label={t("dashboard.tray.stop")}
            // Обрабатываем конструкцию: icon.
            icon={Square}
            // Обрабатываем конструкцию: action.
            action="stop"
            // Продолжаем выражение.
          />
          {/* Выводим текстовое содержимое в JSX. */}
          <button
            // Обрабатываем конструкцию: type.
            type="button"
            // Обрабатываем конструкцию: onClick.
            onClick={vpnAction}
            // Обрабатываем конструкцию: className.
            className={cn(
              // Обрабатываем конструкцию: group flex w-full items-center gap-2 rounded-md px-2 py….
              "group flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left",
              // Обрабатываем конструкцию: text-text-secondary hover:text-text-primary text-[13px].
              "text-text-secondary hover:text-text-primary text-[13px]",
              // Обрабатываем конструкцию: hover:bg-glass-hover transition-colors duration-100.
              "hover:bg-glass-hover transition-colors duration-100"
              // Закрываем выражение или список аргументов.
            )}
            // Продолжаем выражение.
          >
            {/* Выводим текстовое содержимое в JSX. */}
            {isVpn ? (
              // Рендерим самозакрывающийся элемент Unlock.
              <Unlock
                // Обрабатываем конструкцию: aria-hidden.
                aria-hidden="true"
                // Обрабатываем конструкцию: className.
                className="text-text-tertiary group-hover:text-text-primary size-3.5 shrink-0"
                // Обрабатываем конструкцию: strokeWidth.
                strokeWidth={2}
                // Продолжаем выражение.
              />
            ) : (
              // Продолжаем предыдущую конструкцию.
              // Закрываем выражение или список аргументов.
              // Рендерим самозакрывающийся элемент Lock.
              <Lock
                // Обрабатываем конструкцию: aria-hidden.
                aria-hidden="true"
                // Обрабатываем конструкцию: className.
                className="text-text-tertiary group-hover:text-text-primary size-3.5 shrink-0"
                // Обрабатываем конструкцию: strokeWidth.
                strokeWidth={2}
                // Продолжаем выражение.
              />
              // Закрываем выражение или список аргументов.
            )}
            {/* Выводим текстовое содержимое в JSX. */}
            <span className="truncate">
              {/* Выводим текстовое содержимое в JSX. */}
              {isVpn
                ? // Обрабатываем конструкцию: ?.
                  // Продолжаем предыдущую конструкцию.
                  t("dashboard.tray.vpnDisconnect")
                : // Обрабатываем конструкцию: :.
                  // Продолжаем предыдущую конструкцию.
                  t("dashboard.tray.vpnConnect")}
              {/* Выводим текстовое содержимое в JSX. */}
            </span>
            {/* Выводим текстовое содержимое в JSX. */}
          </button>
          {/* — разделитель логических блоков — */}

          {/* Выводим текстовое содержимое в JSX. */}
          <Separator />
          {/* — разделитель логических блоков — */}

          {/* Выводим текстовое содержимое в JSX. */}
          <MenuRow
            // Обрабатываем конструкцию: label.
            label={t("dashboard.tray.dashboard")}
            // Обрабатываем конструкцию: icon.
            icon={LayoutDashboard}
            // Обрабатываем конструкцию: action.
            action="dashboard"
            // Продолжаем выражение.
          />
          {/* Выводим текстовое содержимое в JSX. */}
          <MenuRow
            // Обрабатываем конструкцию: label.
            label={t("dashboard.tray.strategies")}
            // Обрабатываем конструкцию: icon.
            icon={Layers}
            // Обрабатываем конструкцию: action.
            action="strategies"
            // Продолжаем выражение.
          />
          {/* Выводим текстовое содержимое в JSX. */}
          <MenuRow
            // Обрабатываем конструкцию: label.
            label={t("dashboard.tray.logs")}
            // Обрабатываем конструкцию: icon.
            icon={ScrollText}
            // Обрабатываем конструкцию: action.
            action="logs"
            // Продолжаем выражение.
          />
          {/* Выводим текстовое содержимое в JSX. */}
          <MenuRow
            // Обрабатываем конструкцию: label.
            label={t("dashboard.tray.settings")}
            // Обрабатываем конструкцию: icon.
            icon={SettingsIcon}
            // Обрабатываем конструкцию: action.
            action="settings"
            // Продолжаем выражение.
          />
          {/* Выводим текстовое содержимое в JSX. */}
          <MenuRow
            // Обрабатываем конструкцию: label.
            label={t("dashboard.tray.about")}
            // Обрабатываем конструкцию: icon.
            icon={Info}
            // Обрабатываем конструкцию: action.
            action="about"
            // Продолжаем выражение.
          />
          {/* — разделитель логических блоков — */}

          {/* Выводим текстовое содержимое в JSX. */}
          <Separator />
          {/* — разделитель логических блоков — */}

          {/* Выводим текстовое содержимое в JSX. */}
          <MenuRow
            // Обрабатываем конструкцию: label.
            label={t("dashboard.tray.checkUpdates")}
            // Обрабатываем конструкцию: icon.
            icon={RefreshCw}
            // Обрабатываем конструкцию: action.
            action="updates"
            // Продолжаем выражение.
          />
          {/* — разделитель логических блоков — */}

          {/* Выводим текстовое содержимое в JSX. */}
          <Separator />
          {/* — разделитель логических блоков — */}

          {/* Выводим текстовое содержимое в JSX. */}
          <MenuRow
            // Обрабатываем конструкцию: label.
            label={t("dashboard.tray.quit")}
            // Обрабатываем конструкцию: icon.
            icon={LogOut}
            // Обрабатываем конструкцию: action.
            action="quit"
            // Продолжаем выражение.
          />
          {/* Выводим текстовое содержимое в JSX. */}
        </div>
        {/* Выводим текстовое содержимое в JSX. */}
      </div>
      {/* Выводим текстовое содержимое в JSX. */}
    </>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
