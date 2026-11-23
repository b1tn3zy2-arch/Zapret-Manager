// Импортируем зависимости из модуля framer-motion.
import { motion } from "framer-motion";
// Импортируем зависимости из модуля lucide-react.
import { ChevronLeft, ChevronRight, type LucideIcon } from "lucide-react";
// Импортируем зависимости из модуля react.
import { memo, useLayoutEffect, useMemo, useRef, useState } from "react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/components/updates/UpdateBadge.
import UpdateBadge from "@/components/updates/UpdateBadge";
// Импортируем зависимости из модуля @/hooks/useAdaptiveSidebar.
import { useAdaptiveSidebar } from "@/hooks/useAdaptiveSidebar";
// Импортируем зависимости из модуля @/hooks/useMotionPreference.
import { useMotionPreference } from "@/hooks/useMotionPreference";
// Импортируем зависимости из модуля @/hooks/useSystemInfo.
import { useSystemInfo } from "@/hooks/useSystemInfo";
// Импортируем зависимости из модуля @/i18n.
import { useI18n } from "@/i18n";
// Импортируем зависимости из модуля @/lib/constants.
import { NAV_ITEMS, ROUTES, type AppPage } from "@/lib/constants";
// Импортируем зависимости из модуля @/lib/updateUtils.
import { formatVersion } from "@/lib/updateUtils";
// Импортируем зависимости из модуля @/lib/utils.
import { cn } from "@/lib/utils";
// Импортируем зависимости из модуля @/stores/useAppStore.
import { useAppStore } from "@/stores/useAppStore";
// Импортируем зависимости из модуля @/stores/useSettingsStore.
import { useSettingsStore } from "@/stores/useSettingsStore";
// — разделитель логических блоков —

// Сохраняем пояснение разработчика: Отступ полоски-индикатора внутри строки: (44 - 24) / 2.
/** Отступ полоски-индикатора внутри строки: (44 - 24) / 2. */
// Обрабатываем конструкцию: const INDICATOR_TOP = 10.
const INDICATOR_TOP = 10;
// — разделитель логических блоков —

// Объявляем интерфейс NavButtonProps с контрактом данных.
interface NavButtonProps {
  // Обрабатываем конструкцию: readonly.
  readonly label: string;
  // Обрабатываем конструкцию: readonly.
  readonly icon: LucideIcon;
  // Обрабатываем конструкцию: readonly.
  readonly active: boolean;
  // Обрабатываем конструкцию: readonly.
  readonly collapsed: boolean;
  // Обрабатываем конструкцию: readonly.
  readonly onSelect: () => void;
  // Обрабатываем конструкцию: readonly.
  readonly showUpdateBadge?: boolean | undefined;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию NavButtonImpl.
function NavButtonImpl({
  // Обрабатываем конструкцию: label.
  label,
  // Обрабатываем конструкцию: icon.
  icon: Icon,
  // Обрабатываем конструкцию: active.
  active,
  // Обрабатываем конструкцию: collapsed.
  collapsed,
  // Обрабатываем конструкцию: onSelect.
  onSelect,
  // Обрабатываем конструкцию: showUpdateBadge.
  showUpdateBadge = false,
  // Закрываем текущий блок.
}: NavButtonProps) {
  // Возвращаем результат: ( <li className=relative> <motion.button type=button on….
  return (
    // Обрабатываем конструкцию: <li className=relative>.
    <li className="relative">
      {/* Выводим текстовое содержимое в JSX. */}
      <motion.button
        // Обрабатываем конструкцию: type.
        type="button"
        // Обрабатываем конструкцию: onMouseDown.
        onMouseDown={(event) => {
          // Обрабатываем конструкцию: event.
          event.preventDefault();
          // Закрываем текущий блок.
        }}
        // Обрабатываем конструкцию: onClick.
        onClick={onSelect}
        // Обрабатываем конструкцию: aria-label.
        aria-label={label}
        // Обрабатываем конструкцию: aria-current.
        aria-current={active ? "page" : undefined}
        // Обрабатываем конструкцию: data-focus-quiet.
        data-focus-quiet="true"
        // Обрабатываем конструкцию: whileTap.
        whileTap={{ scale: 0.98 }}
        // Обрабатываем конструкцию: className.
        className={cn(
          // Обрабатываем конструкцию: group relative flex h-11 w-full items-center gap-3 roun….
          "group relative flex h-11 w-full items-center gap-3 rounded-lg",
          // Обрабатываем конструкцию: transition-colors duration-200 ease-out.
          "transition-colors duration-200 ease-out",
          // Обрабатываем конструкцию: collapsed.
          collapsed ? "justify-center" : "px-3"
          // Закрываем выражение или список аргументов.
        )}
        // Продолжаем выражение.
      >
        {/* Выводим текстовое содержимое в JSX. */}
        <Icon
          // Обрабатываем конструкцию: aria-hidden.
          aria-hidden="true"
          // Обрабатываем конструкцию: strokeWidth.
          strokeWidth={2}
          // Обрабатываем конструкцию: className.
          className={cn(
            // Обрабатываем конструкцию: size-5 shrink-0 transition-colors duration-200 ease-out.
            "size-5 shrink-0 transition-colors duration-200 ease-out",
            // Обрабатываем конструкцию: active.
            active
              ? // Обрабатываем конструкцию: ?.
                // Продолжаем предыдущую конструкцию.
                "text-accent-primary"
              : // Обрабатываем конструкцию: :.
                // Продолжаем предыдущую конструкцию.
                "text-text-secondary group-hover:text-text-primary"
            // Закрываем выражение или список аргументов.
          )}
          // Продолжаем выражение.
        />
        {/* — разделитель логических блоков — */}

        {/* Выводим текстовое содержимое в JSX. */}
        <span
          // Обрабатываем конструкцию: className.
          className={cn(
            // Обрабатываем конструкцию: text-text-primary truncate text-sm transition-opacity d….
            "text-text-primary truncate text-sm transition-opacity duration-200 ease-out",
            // Обрабатываем конструкцию: collapsed.
            collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
            // Закрываем выражение или список аргументов.
          )}
          // Продолжаем выражение.
        >
          {/* Выводим текстовое содержимое в JSX. */}
          {label}
          {/* Выводим текстовое содержимое в JSX. */}
        </span>
        {/* — разделитель логических блоков — */}

        {/* Выводим текстовое содержимое в JSX. */}
        {collapsed ? (
          // Обрабатываем конструкцию: <span role=tooltip className=border-glass-border bg-bg-….
          <span
            // Обрабатываем конструкцию: role.
            role="tooltip"
            // Обрабатываем конструкцию: className.
            className="border-glass-border bg-bg-tertiary text-text-primary pointer-events-none absolute top-1/2 left-full z-20 ml-2 -translate-y-1/2 rounded-md border px-2 py-1 text-xs whitespace-nowrap opacity-0 shadow-lg transition-opacity duration-150 ease-out group-hover:opacity-100"
            // Продолжаем выражение.
          >
            {/* Выводим текстовое содержимое в JSX. */}
            {label}
            {/* Выводим текстовое содержимое в JSX. */}
          </span>
        ) : // Закрываем выражение или список аргументов.
        // Продолжаем предыдущую конструкцию.
        null}
        {/* — разделитель логических блоков — */}

        {/* Выводим текстовое содержимое в JSX. */}
        {showUpdateBadge ? <UpdateBadge /> : null}
        {/* Выводим текстовое содержимое в JSX. */}
      </motion.button>
      {/* Выводим текстовое содержимое в JSX. */}
    </li>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: const NavButton = memo(NavButtonImpl).
const NavButton = memo(NavButtonImpl);
// — разделитель логических блоков —

// Объявляем функцию Sidebar.
function Sidebar() {
  // Обрабатываем конструкцию: const { reduced: prefersReducedMotion } = useMotionPref….
  const { reduced: prefersReducedMotion } = useMotionPreference();
  // Обрабатываем конструкцию: const { t } = useI18n().
  const { t } = useI18n();
  // Обрабатываем конструкцию: const activePage = useAppStore((state) => state.activeP….
  const activePage = useAppStore((state) => state.activePage);
  // Обрабатываем конструкцию: const { isCollapsed: collapsed, toggle: toggleSidebar }….
  const { isCollapsed: collapsed, toggle: toggleSidebar } =
    // Обрабатываем конструкцию: useAdaptiveSidebar.
    useAdaptiveSidebar();
  // Обрабатываем конструкцию: const logsEnabled = useSettingsStore( (state) => state.….
  const logsEnabled = useSettingsStore(
    // Объявляем функцию-обработчик или стрелочную функцию.
    (state) => state.settings.general.enableLogs
    // Закрываем выражение или список аргументов.
  );
  // Обрабатываем конструкцию: const { info } = useSystemInfo().
  const { info } = useSystemInfo();
  // Обрабатываем конструкцию: const version = useMemo(() => { const raw = info?.appVe….
  const version = useMemo(() => {
    // Обрабатываем конструкцию: const raw = info?.appVersion ??.
    const raw = info?.appVersion ?? "";
    // — разделитель логических блоков —

    // Возвращаем результат: raw === ? null : formatVersion(raw).
    return raw === "" ? null : formatVersion(raw);
    // Закрываем текущий блок.
  }, [info?.appVersion]);
  // Обрабатываем конструкцию: const items = useMemo( () => logsEnabled ? NAV_ITEMS : ….
  const items = useMemo(
    // Объявляем функцию-обработчик или стрелочную функцию.
    () =>
      // Обрабатываем конструкцию: logsEnabled.
      logsEnabled
        ? // Обрабатываем конструкцию: ?.
          // Продолжаем предыдущую конструкцию.
          NAV_ITEMS
        : // Обрабатываем конструкцию: :.
          // Продолжаем предыдущую конструкцию.
          NAV_ITEMS.filter((item) => item.route !== ROUTES.logs),
    // Открываем массив.
    [logsEnabled]
    // Закрываем выражение или список аргументов.
  );
  // Обрабатываем конструкцию: const setActivePage = useAppStore((state) => state.setA….
  const setActivePage = useAppStore((state) => state.setActivePage);
  // Обрабатываем конструкцию: const listRef = useRef<HTMLUListElement | null>(null).
  const listRef = useRef<HTMLUListElement | null>(null);
  // Обрабатываем конструкцию: const [indicatorOffset, setIndicatorOffset] = useState(….
  const [indicatorOffset, setIndicatorOffset] = useState(0);
  // — разделитель логических блоков —

  // Сохраняем пояснение разработчика: // Позиция полоски берётся из раскладки, а не из индекса пун…
  // Позиция полоски берётся из раскладки, а не из индекса пункта: список
  // Сохраняем пояснение разработчика: // меняется (настройка логов включает и отключает «Логи»), и…
  // меняется (настройка логов включает и отключает «Логи»), и индекс перестал
  // Сохраняем пояснение разработчика: // бы совпадать с реальным положением строки.
  // бы совпадать с реальным положением строки.
  // Обрабатываем конструкцию: useLayoutEffect.
  useLayoutEffect(() => {
    // Обрабатываем конструкцию: const list = listRef.current.
    const list = listRef.current;
    // — разделитель логических блоков —

    // Проверяем бизнес-условие: list === null.
    if (list === null) {
      // Завершаем функцию без возвращаемого значения.
      return;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const active = list.querySelector<HTMLElement>([aria-cu….
    const active = list.querySelector<HTMLElement>('[aria-current="page"]');
    // — разделитель логических блоков —

    // Проверяем бизнес-условие: active === null.
    if (active === null) {
      // Завершаем функцию без возвращаемого значения.
      return;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Сохраняем пояснение разработчика: // Положение берём относительно списка: у пункта собственный
    // Положение берём относительно списка: у пункта собственный
    // Сохраняем пояснение разработчика: // позиционированный родитель, поэтому offsetTop считал бы о…
    // позиционированный родитель, поэтому offsetTop считал бы от него и
    // Сохраняем пояснение разработчика: // уводил полоску мимо цели.
    // уводил полоску мимо цели.
    // Обрабатываем конструкцию: setIndicatorOffset.
    setIndicatorOffset(
      // Обрабатываем конструкцию: active.
      active.getBoundingClientRect().top - list.getBoundingClientRect().top
      // Закрываем выражение или список аргументов.
    );
    // Закрываем текущий блок.
  }, [activePage, items.length, collapsed]);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const selectHandlers = useMemo(() => { const handlers =….
  const selectHandlers = useMemo(() => {
    // Обрабатываем конструкцию: const handlers = {} as Record<AppPage, () => void>.
    const handlers = {} as Record<AppPage, () => void>;
    // — разделитель логических блоков —

    // Перебираем элементы коллекции items.
    for (const item of items) {
      // Обрабатываем конструкцию: handlers.
      handlers[item.route] = () => {
        // Обрабатываем конструкцию: setActivePage.
        setActivePage(item.route);
        // Закрываем текущий блок.
      };
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Возвращаем результат: handlers.
    return handlers;
    // Закрываем текущий блок.
  }, [items, setActivePage]);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const width = collapsed ? var(--sidebar-width-collapsed….
  const width = collapsed
    ? // Обрабатываем конструкцию: ?.
      // Продолжаем предыдущую конструкцию.
      "var(--sidebar-width-collapsed)"
    : // Обрабатываем конструкцию: :.
      // Продолжаем предыдущую конструкцию.
      "var(--sidebar-width-expanded)";
  // — разделитель логических блоков —

  // Возвращаем результат: ( <motion.aside animate={{ width }} initial={false} tra….
  return (
    // Обрабатываем конструкцию: <motion.aside animate={{ width }} initial={false} trans….
    <motion.aside
      // Обрабатываем конструкцию: animate.
      animate={{ width }}
      // Обрабатываем конструкцию: initial.
      initial={false}
      // Обрабатываем конструкцию: transition.
      transition={
        // Обрабатываем конструкцию: prefersReducedMotion.
        prefersReducedMotion
          ? // Обрабатываем конструкцию: ?.
            // Продолжаем предыдущую конструкцию.
            { duration: 0 }
          : // Обрабатываем конструкцию: :.
            // Продолжаем предыдущую конструкцию.
            { type: "tween", duration: 0.26, ease: [0.16, 1, 0.3, 1] }
        // Закрываем текущий блок.
      }
      // Обрабатываем конструкцию: className.
      className="flex shrink-0 flex-col overflow-visible"
      // Продолжаем выражение.
    >
      {/* Выводим текстовое содержимое в JSX. */}
      <div
        // Обрабатываем конструкцию: className.
        className={cn(
          // Обрабатываем конструкцию: flex h-11 shrink-0 items-center px-3.
          "flex h-11 shrink-0 items-center px-3",
          // Обрабатываем конструкцию: collapsed.
          collapsed ? "justify-center" : "justify-end"
          // Закрываем выражение или список аргументов.
        )}
        // Продолжаем выражение.
      >
        {/* Выводим текстовое содержимое в JSX. */}
        <button
          // Обрабатываем конструкцию: type.
          type="button"
          // Обрабатываем конструкцию: onMouseDown.
          onMouseDown={(event) => {
            // Обрабатываем конструкцию: event.
            event.preventDefault();
            // Закрываем текущий блок.
          }}
          // Обрабатываем конструкцию: onClick.
          onClick={toggleSidebar}
          // Обрабатываем конструкцию: aria-label.
          aria-label={collapsed ? t("sidebar.expand") : t("sidebar.collapse")}
          // Обрабатываем конструкцию: aria-expanded.
          aria-expanded={!collapsed}
          // Обрабатываем конструкцию: data-focus-quiet.
          data-focus-quiet="true"
          // Обрабатываем конструкцию: className.
          className="text-text-secondary hover:text-text-primary hover:bg-glass-hover flex size-7 items-center justify-center rounded-md transition-colors duration-200 ease-out"
          // Продолжаем выражение.
        >
          {/* Выводим текстовое содержимое в JSX. */}
          {collapsed ? (
            // Рендерим самозакрывающийся элемент ChevronRight.
            <ChevronRight
              // Обрабатываем конструкцию: aria-hidden.
              aria-hidden="true"
              // Обрабатываем конструкцию: className.
              className="size-4"
              // Обрабатываем конструкцию: strokeWidth.
              strokeWidth={2}
              // Продолжаем выражение.
            />
          ) : (
            // Продолжаем предыдущую конструкцию.
            // Закрываем выражение или список аргументов.
            // Рендерим самозакрывающийся элемент ChevronLeft.
            <ChevronLeft
              // Обрабатываем конструкцию: aria-hidden.
              aria-hidden="true"
              // Обрабатываем конструкцию: className.
              className="size-4"
              // Обрабатываем конструкцию: strokeWidth.
              strokeWidth={2}
              // Продолжаем выражение.
            />
            // Закрываем выражение или список аргументов.
          )}
          {/* Выводим текстовое содержимое в JSX. */}
        </button>
        {/* Выводим текстовое содержимое в JSX. */}
      </div>
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <nav aria-label={t("sidebar.mainNav")} className="flex-1 px-3">
        {/* Выводим текстовое содержимое в JSX. */}
        <ul ref={listRef} className="relative flex flex-col gap-1">
          {/* Выводим текстовое содержимое в JSX. */}
          {items.map((item) => (
            // Рендерим самозакрывающийся элемент NavButton.
            <NavButton
              // Обрабатываем конструкцию: key.
              key={item.route}
              // Обрабатываем конструкцию: label.
              label={t(item.labelKey)}
              // Обрабатываем конструкцию: icon.
              icon={item.icon}
              // Обрабатываем конструкцию: active.
              active={item.route === activePage}
              // Обрабатываем конструкцию: collapsed.
              collapsed={collapsed}
              // Обрабатываем конструкцию: onSelect.
              onSelect={selectHandlers[item.route]}
              // Обрабатываем конструкцию: showUpdateBadge.
              showUpdateBadge={item.route === ROUTES.settings}
              // Продолжаем выражение.
            />
            // Закрываем выражение или список аргументов.
          ))}
          {/* — разделитель логических блоков — */}

          {/* Выводим текстовое содержимое в JSX. */}
          {/*
            // Продолжаем выражение.
            Индикатор — один элемент на весь список, а не отдельная полоска в
            // Продолжаем выражение.
            каждой кнопке. Общая анимация layoutId рисовала два элемента и
            // Продолжаем выражение.
            прогоняла их через проекцию раскладки: полоска перелетывала нужный
            // Продолжаем выражение.
            пункт и возвращалась назад. Теперь позиция задаётся одним
            // Продолжаем выражение.
            transform и переходом CSS — движение гарантированно ровное.
          // Сохраняем пояснение разработчика: * /}
          */}
          {/* Выводим текстовое содержимое в JSX. */}
          <span
            // Обрабатываем конструкцию: aria-hidden.
            aria-hidden="true"
            // Обрабатываем конструкцию: data-testid.
            data-testid="sidebar-active-indicator"
            // Обрабатываем конструкцию: className.
            className="sidebar-active-indicator bg-accent-primary"
            // Обрабатываем конструкцию: style.
            style={{
              // Обрабатываем конструкцию: top.
              top: INDICATOR_TOP,
              // Обрабатываем конструкцию: transform.
              transform: `translateY(${indicatorOffset}px)`,
              // Закрываем текущий блок.
            }}
            // Продолжаем выражение.
          />
          {/* Выводим текстовое содержимое в JSX. */}
        </ul>
        {/* Выводим текстовое содержимое в JSX. */}
      </nav>
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      {/* Версия внизу панели: раньше она стояла в подвале страницы и
          // Продолжаем выражение.
          пропадала при переключении разделов. */}
      {/* Выводим текстовое содержимое в JSX. */}
      {collapsed || version === null ? null : (
        // Обрабатываем конструкцию: <div className=shrink-0 px-4 pb-4>.
        <div className="shrink-0 px-4 pb-4">
          {/* Выводим текстовое содержимое в JSX. */}
          <span className="text-text-tertiary font-mono text-[11px]">
            {/* Выводим текстовое содержимое в JSX. */}
            {version}
            {/* Выводим текстовое содержимое в JSX. */}
          </span>
          {/* Выводим текстовое содержимое в JSX. */}
        </div>
        // Закрываем выражение или список аргументов.
      )}
      {/* Выводим текстовое содержимое в JSX. */}
    </motion.aside>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export default memo(Sidebar);.
export default memo(Sidebar);
// — разделитель логических блоков —
