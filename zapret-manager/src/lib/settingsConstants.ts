import {
  Activity,
  Layers,
  RefreshCw,
  Settings,
  Shield,
  SlidersHorizontal,
  type LucideIcon,
} from "lucide-react";

import type { TranslationKey } from "@/i18n";
import type { DensityMode, SettingsSection } from "@/types";

export interface AboutLink {
  readonly id: string;
  readonly labelKey: TranslationKey;
  readonly url: string;
}

export const ABOUT_LINKS: readonly AboutLink[] = [
  {
    id: "upstream",
    labelKey: "about.upstream",
    url: "https://github.com/Flowseal/zapret-discord-youtube",
  },
];

export const DENSITY_SCALE: Record<DensityMode, number> = {
  compact: 0.9,
  normal: 1,
  comfy: 1.1,
};

export const SETTINGS_SAVED_INDICATOR_MS = 2000;

export const SETTINGS_SECTIONS = [
  "general",
  "vpn",
  "appearance",
  "strategies",
  "updates",
  "advanced",
] as const satisfies readonly SettingsSection[];

export function isSettingsSection(value: string): value is SettingsSection {
  return (SETTINGS_SECTIONS as readonly string[]).includes(value);
}

export const SETTINGS_SECTION_ICONS = {
  general: SlidersHorizontal,
  vpn: Shield,
  appearance: Settings,
  strategies: Layers,
  updates: RefreshCw,
  advanced: Activity,
} as const satisfies Record<SettingsSection, LucideIcon>;
