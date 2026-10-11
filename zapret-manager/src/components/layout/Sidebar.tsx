import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, type LucideIcon } from "lucide-react";
import { memo, useMemo } from "react";

import UpdateBadge from "@/components/updates/UpdateBadge";
import { useAdaptiveSidebar } from "@/hooks/useAdaptiveSidebar";
import { useMotionPreference } from "@/hooks/useMotionPreference";
import { useBloom } from "@/hooks/useBloom";
import { useI18n } from "@/i18n";
import { NAV_ITEMS, ROUTES, type AppPage } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/useAppStore";
import { useSettingsStore } from "@/stores/useSettingsStore";

const ACTIVE_INDICATOR_ID = "sidebar-active-indicator";
const SIDEBAR_TRANSITION = {
  duration: 0.25,
  ease: [0.16, 1, 0.3, 1],
} as const;

interface NavButtonProps {
  readonly label: string;
  readonly icon: LucideIcon;
  readonly active: boolean;
  readonly collapsed: boolean;
  readonly onSelect: () => void;
  readonly showUpdateBadge?: boolean | undefined;
}

function NavButtonImpl({
  label,
  icon: Icon,
  active,
  collapsed,
  onSelect,
  showUpdateBadge = false,
}: NavButtonProps) {
  const bloom = useBloom("primary", -1);

  return (
    <li className="relative">
      <motion.button
        type="button"
        onMouseDown={(event) => {
          event.preventDefault();
        }}
        onClick={onSelect}
        aria-current={active ? "page" : undefined}
        aria-label={label}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "group relative flex h-11 w-full items-center gap-3 rounded-lg",
          "transition-colors duration-200 ease-out",
          "hover:bg-glass-hover",
          active && (collapsed ? "bg-accent-primary/12" : "bg-glass-hover"),
          collapsed ? "justify-center" : "px-3"
        )}
      >
        {active && !collapsed ? (
          <motion.span
            layoutId={ACTIVE_INDICATOR_ID}
            transition={SIDEBAR_TRANSITION}
            {...(bloom.boxShadow === ""
              ? {}
              : { style: { boxShadow: bloom.boxShadow } })}
            className="bg-accent-primary absolute top-1/2 left-0 h-6 w-[3px] -translate-y-1/2 rounded-r-full shadow-[0_0_8px_var(--color-accent-primary)]"
          />
        ) : null}

        <Icon
          aria-hidden="true"
          strokeWidth={2}
          className={cn(
            "size-5 shrink-0 transition-colors duration-200 ease-out",
            active
              ? "text-accent-primary"
              : "text-text-secondary group-hover:text-text-primary"
          )}
        />

        <span
          className={cn(
            "text-text-primary truncate text-sm transition-opacity duration-200 ease-out",
            collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
          )}
        >
          {label}
        </span>

        {collapsed ? (
          <span
            role="tooltip"
            className="border-glass-border bg-bg-tertiary text-text-primary pointer-events-none absolute top-1/2 left-full z-20 ml-2 -translate-y-1/2 rounded-md border px-2 py-1 text-xs whitespace-nowrap opacity-0 shadow-lg transition-opacity duration-150 ease-out group-hover:opacity-100"
          >
            {label}
          </span>
        ) : null}

        {showUpdateBadge ? <UpdateBadge /> : null}
      </motion.button>
    </li>
  );
}

const NavButton = memo(NavButtonImpl);

function Sidebar() {
  const { reduced: prefersReducedMotion } = useMotionPreference();
  const { t } = useI18n();
  const activePage = useAppStore((state) => state.activePage);
  const { isCollapsed: collapsed, toggle: toggleSidebar } =
    useAdaptiveSidebar();
  const logsEnabled = useSettingsStore(
    (state) => state.settings.general.enableLogs
  );
  const items = useMemo(
    () =>
      logsEnabled
        ? NAV_ITEMS
        : NAV_ITEMS.filter((item) => item.route !== ROUTES.logs),
    [logsEnabled]
  );
  const setActivePage = useAppStore((state) => state.setActivePage);

  const selectHandlers = useMemo(() => {
    const handlers = {} as Record<AppPage, () => void>;

    for (const item of items) {
      handlers[item.route] = () => {
        setActivePage(item.route);
      };
    }

    return handlers;
  }, [items, setActivePage]);

  const width = collapsed
    ? "var(--sidebar-width-collapsed)"
    : "var(--sidebar-width-expanded)";

  return (
    <motion.aside
      animate={{ width }}
      initial={false}
      transition={prefersReducedMotion ? { duration: 0 } : SIDEBAR_TRANSITION}
      className="flex shrink-0 flex-col overflow-visible"
    >
      <div
        className={cn(
          "flex h-11 shrink-0 items-center px-3",
          collapsed ? "justify-center" : "justify-end"
        )}
      >
        <button
          type="button"
          onMouseDown={(event) => {
            event.preventDefault();
          }}
          onClick={toggleSidebar}
          aria-label={collapsed ? t("sidebar.expand") : t("sidebar.collapse")}
          aria-expanded={!collapsed}
          className="text-text-secondary hover:text-text-primary hover:bg-glass-hover flex size-7 items-center justify-center rounded-md transition-colors duration-200 ease-out"
        >
          {collapsed ? (
            <ChevronRight
              aria-hidden="true"
              className="size-4"
              strokeWidth={2}
            />
          ) : (
            <ChevronLeft
              aria-hidden="true"
              className="size-4"
              strokeWidth={2}
            />
          )}
        </button>
      </div>

      <nav aria-label={t("sidebar.mainNav")} className="flex-1 px-3">
        <ul className="flex flex-col gap-1">
          {items.map((item) => (
            <NavButton
              key={item.route}
              label={t(item.labelKey)}
              icon={item.icon}
              active={item.route === activePage}
              collapsed={collapsed}
              onSelect={selectHandlers[item.route]}
              showUpdateBadge={item.route === ROUTES.settings}
            />
          ))}
        </ul>
      </nav>
    </motion.aside>
  );
}

export default memo(Sidebar);
