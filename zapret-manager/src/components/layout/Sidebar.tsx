import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, type LucideIcon } from "lucide-react";
import { memo, useMemo } from "react";

import UpdateBadge from "@/components/updates/UpdateBadge";
import { useAdaptiveSidebar } from "@/hooks/useAdaptiveSidebar";
import { useMotionPreference } from "@/hooks/useMotionPreference";
import { useBloom } from "@/hooks/useBloom";
import { useI18n } from "@/i18n";
import {
  CONNECTION_LABELS,
  NAV_ITEMS,
  ROUTES,
  type AppPage,
  type ConnectionStatus,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useConnectionStatus } from "@/stores/selectors";
import { useAppStore } from "@/stores/useAppStore";

const ACTIVE_INDICATOR_ID = "sidebar-active-indicator";
const SIDEBAR_TRANSITION = {
  duration: 0.25,
  ease: [0.16, 1, 0.3, 1],
} as const;

const STATUS_DOT_CLASSES = {
  connected:
    "bg-accent-primary animate-pulse shadow-[0_0_8px_var(--color-accent-primary)]",
  connecting: "bg-accent-warning animate-pulse",
  vpn: "bg-accent-secondary",
  disconnected: "bg-text-tertiary",
  error: "bg-accent-danger",
} as const satisfies Record<ConnectionStatus, string>;

const STATUS_TEXT_CLASSES = {
  connected: "text-text-primary",
  connecting: "text-accent-warning",
  vpn: "text-accent-secondary",
  disconnected: "text-text-tertiary",
  error: "text-accent-danger",
} as const satisfies Record<ConnectionStatus, string>;

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
  const bloom = useBloom("primary", "subtle");

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
          "group relative flex h-11 w-full items-center gap-3 rounded-md",
          "transition-colors duration-200 ease-out",
          "hover:bg-glass-hover",
          active && "bg-glass-hover",
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

interface StatusIndicatorProps {
  readonly status: ConnectionStatus;
  readonly collapsed: boolean;
}

function StatusIndicator({ status, collapsed }: StatusIndicatorProps) {
  const { t } = useI18n();
  const statusLabel = t(CONNECTION_LABELS[status]);

  return (
    <button
      type="button"
      aria-label={t("connection.aria", { status: statusLabel })}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-md px-3 py-2",
        "hover:bg-glass-hover transition-colors duration-200 ease-out",
        collapsed && "justify-center px-0"
      )}
    >
      <span
        className={cn(
          "size-2 shrink-0 rounded-full",
          STATUS_DOT_CLASSES[status]
        )}
      />
      {!collapsed ? (
        <span
          className={cn(
            "truncate text-xs font-medium",
            STATUS_TEXT_CLASSES[status]
          )}
        >
          {statusLabel}
        </span>
      ) : null}
    </button>
  );
}

export default function Sidebar() {
  const { reduced: prefersReducedMotion } = useMotionPreference();
  const { t } = useI18n();
  const activePage = useAppStore((state) => state.activePage);
  const { isCollapsed: collapsed, toggle: toggleSidebar } =
    useAdaptiveSidebar();
  const setActivePage = useAppStore((state) => state.setActivePage);
  const status = useConnectionStatus();

  const selectHandlers = useMemo(() => {
    const handlers = {} as Record<AppPage, () => void>;

    for (const item of NAV_ITEMS) {
      handlers[item.route] = () => {
        setActivePage(item.route);
      };
    }

    return handlers;
  }, [setActivePage]);

  const width = collapsed
    ? "var(--sidebar-width-collapsed)"
    : "var(--sidebar-width-expanded)";

  return (
    <motion.aside
      animate={{ width }}
      initial={false}
      transition={prefersReducedMotion ? { duration: 0 } : SIDEBAR_TRANSITION}
      className="bg-bg-secondary/40 border-glass-border flex shrink-0 flex-col overflow-visible border-r"
    >
      <div
        className={cn(
          "flex h-11 shrink-0 items-center px-3",
          collapsed ? "justify-center" : "justify-end"
        )}
      >
        {" "}
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
          {NAV_ITEMS.map((item) => (
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

      <div className="shrink-0 px-3 pb-3">
        <StatusIndicator status={status} collapsed={collapsed} />
      </div>
    </motion.aside>
  );
}
