import type { NotificationKind } from "@/types";

export const NOTIFY_PREFIX = "notify:";

export interface ParsedNotify {
  kind: NotificationKind;
  title: string;
  body: string;
}

const KINDS: NotificationKind[] = ["success", "error", "warning", "info"];

export function parseNotify(raw: string): ParsedNotify | null {
  if (!raw.startsWith(NOTIFY_PREFIX)) {
    return null;
  }

  const rest = raw.slice(NOTIFY_PREFIX.length);
  const colon = rest.indexOf(":");

  if (colon === -1) {
    return null;
  }

  const kind = rest.slice(0, colon);
  const parts = rest.slice(colon + 1).split("|");

  if (parts.length < 2) {
    return null;
  }

  const [title, body] = parts;

  if (title === undefined || body === undefined) {
    return null;
  }

  if (!KINDS.includes(kind as NotificationKind)) {
    return null;
  }

  return { kind: kind as NotificationKind, title, body };
}
