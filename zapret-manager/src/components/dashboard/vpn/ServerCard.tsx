import { memo, useEffect, useRef, useState } from "react";
import { Check, Copy, Globe, Link2, Trash2 } from "lucide-react";

import CountryFlag from "@/components/dashboard/CountryFlag";
import { useI18n } from "@/i18n";
import { guessCountryCode } from "@/lib/vpnEndpoint";
import { formatPing, getPingColor } from "@/lib/pingUtils";
import { cn } from "@/lib/utils";
import type { SubscriptionServer } from "@/types";

export interface ServerCardProps {
  server: SubscriptionServer;
  isActive: boolean;
  ping: number | null;
  onSelect: (server: SubscriptionServer) => void;
  onRemove: (server: SubscriptionServer) => void;
}

const FLAG_SIZE = 28;

function PingIndicator({ ping }: { ping: number | null }) {
  if (ping === null) {
    return (
      <span className="text-accent-danger flex items-center gap-1.5 text-xs font-medium">
        <span
          aria-hidden="true"
          className="bg-accent-danger size-1.5 rounded-full"
        />
        n/a
      </span>
    );
  }

  const color = getPingColor(ping);

  return (
    <span
      className="flex items-center gap-1.5 text-xs font-medium"
      style={{ color }}
    >
      <span
        aria-hidden="true"
        className="size-1.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {formatPing(ping)}
    </span>
  );
}

function ServerMenu({
  server,
  disabled,
  onSelect,
  onRemove,
}: {
  server: SubscriptionServer;
  disabled: boolean;
  onSelect: (server: SubscriptionServer) => void;
  onRemove: (server: SubscriptionServer) => void;
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onPointerDown = (event: MouseEvent): void => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const itemClass =
    "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs " +
    "text-text-secondary transition-colors hover:bg-glass-hover hover:text-text-primary " +
    "disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label={t("dashboard.vpn.serverMenu").replace(
          "{name}",
          server.name
        )}
        aria-expanded={open}
        onClick={() => {
          setOpen((value) => !value);
        }}
        className={cn(
          "text-text-tertiary hover:text-text-primary hover:bg-glass-hover",
          "rounded-md p-1.5 transition-colors"
        )}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="size-4 fill-current"
        >
          <circle cx="5" cy="12" r="1.8" />
          <circle cx="12" cy="12" r="1.8" />
          <circle cx="19" cy="12" r="1.8" />
        </svg>
      </button>

      {open ? (
        <div className="border-glass-border bg-bg-secondary absolute right-0 bottom-full z-20 mb-1 flex w-44 flex-col gap-0.5 rounded-lg border p-1 shadow-xl">
          <button
            type="button"
            disabled={disabled}
            className={itemClass}
            onClick={() => {
              setOpen(false);
              onSelect(server);
            }}
          >
            <Link2 aria-hidden="true" className="size-3.5 shrink-0" />
            {t("dashboard.vpn.serverMenuConnect")}
          </button>

          <button
            type="button"
            className={itemClass}
            onClick={() => {
              setOpen(false);
              void navigator.clipboard.writeText(server.link).then(() => {
                setCopied(true);
                window.setTimeout(() => {
                  setCopied(false);
                }, 1500);
              });
            }}
          >
            {copied ? (
              <Check aria-hidden="true" className="size-3.5 shrink-0" />
            ) : (
              <Copy aria-hidden="true" className="size-3.5 shrink-0" />
            )}
            {copied
              ? t("dashboard.vpn.serverMenuCopied")
              : t("dashboard.vpn.serverMenuCopy")}
          </button>

          <button
            type="button"
            disabled={disabled}
            className={cn(
              itemClass,
              "text-accent-danger hover:text-accent-danger"
            )}
            onClick={() => {
              setOpen(false);
              onRemove(server);
            }}
          >
            <Trash2 aria-hidden="true" className="size-3.5 shrink-0" />
            {t("dashboard.vpn.serverMenuDelete")}
          </button>
        </div>
      ) : null}
    </div>
  );
}

/**
 * Строка сервера по референсу: флаг и имя слева, под ними теги протокола и
 * транспорта, справа точка с пингом и меню действий.
 */
function ServerCardImpl({
  server,
  isActive,
  ping,
  onSelect,
  onRemove,
}: ServerCardProps) {
  const { t } = useI18n();
  const country = guessCountryCode(server.host);
  // Поля transport и security появились вместе с тегами в строке. Серверы,
  // сохранённые прошлой сборкой, лежат в хранилище без них, и жёсткое
  // обращение роняло весь интерфейс при переходе в режим VPN.
  const transport = (server.transport ?? "").trim().toUpperCase();
  const security = (server.security ?? "").trim().toUpperCase();
  const meta = [transport, security]
    .filter((value) => value !== "")
    .join(" · ");

  return (
    <div
      role="listitem"
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
        "hover:bg-glass-hover duration-200",
        isActive ? "border-accent-primary bg-glass-bg border" : ""
      )}
    >
      <button
        type="button"
        onClick={() => {
          onSelect(server);
        }}
        aria-label={t("dashboard.vpn.selectServer").replace(
          "{name}",
          server.name
        )}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
      >
        {country === null ? (
          <span
            aria-hidden="true"
            className="text-text-tertiary border-glass-border bg-glass-bg flex shrink-0 items-center justify-center rounded-md border"
            style={{ width: FLAG_SIZE, height: FLAG_SIZE }}
          >
            <Globe className="size-4" strokeWidth={2} />
          </span>
        ) : (
          <CountryFlag countryCode={country} size={FLAG_SIZE} />
        )}

        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="text-text-primary truncate text-[15px] leading-none font-medium">
            {server.name}
          </span>

          <span className="flex items-center gap-1.5">
            <span className="border-accent-primary/40 bg-accent-primary/10 text-accent-primary rounded px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase">
              {server.protocol}
            </span>

            {meta === "" ? null : (
              <span className="text-text-tertiary text-[10px] tracking-wide uppercase">
                {meta}
              </span>
            )}
          </span>
        </span>
      </button>

      <PingIndicator ping={ping} />

      <ServerMenu
        server={server}
        disabled={isActive}
        onSelect={onSelect}
        onRemove={onRemove}
      />
    </div>
  );
}

const MemoServerCard = memo(ServerCardImpl);

export default MemoServerCard;
