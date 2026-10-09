import {
  Activity,
  Gamepad2,
  Info,
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

/**
 * Ссылки в разделе «О приложении».
 *
 * Репозиторий приложения не публикуется, поэтому ссылки на исходный код, документацию
 * и баг-репорты не выводились бы: они вели бы в никуда. Раздел показывает только
 * upstream-проект zapret, откуда взяты стратегии и на который реально можно перейти.
 */
export const ABOUT_LINKS: readonly AboutLink[] = [
  {
    id: "upstream",
    labelKey: "settings.about.upstream",
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
  "appearance",
  "strategies",
  "outlast",
  "vpn",
  "updates",
  "advanced",
  "about",
] as const satisfies readonly SettingsSection[];

export const SETTINGS_SECTION_ICONS = {
  general: SlidersHorizontal,
  appearance: Settings,
  strategies: Layers,
  outlast: Gamepad2,
  vpn: Shield,
  updates: RefreshCw,
  advanced: Activity,
  about: Info,
} as const satisfies Record<SettingsSection, LucideIcon>;
