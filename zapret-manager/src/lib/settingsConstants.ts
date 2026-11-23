// Импортируем зависимости из модуля lucide-react.
import {
  // Подключаем именованный импорт Activity.
  Activity,
  // Подключаем именованный импорт Layers.
  Layers,
  // Подключаем именованный импорт RefreshCw.
  RefreshCw,
  // Подключаем именованный импорт Settings.
  Settings,
  // Подключаем именованный импорт Shield.
  Shield,
  // Подключаем именованный импорт SlidersHorizontal.
  SlidersHorizontal,
  // Подключаем именованный импорт type LucideIcon.
  type LucideIcon,
  // Закрываем текущий блок.
} from "lucide-react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/i18n.
import type { TranslationKey } from "@/i18n";
// Импортируем зависимости из модуля @/types.
import type { DensityMode, SettingsSection } from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface AboutLink {
  // Обрабатываем конструкцию: readonly.
  readonly id: string;
  // Обрабатываем конструкцию: readonly.
  readonly labelKey: TranslationKey;
  // Обрабатываем конструкцию: readonly.
  readonly url: string;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const ABOUT_LINKS: readonly AboutLink[] = [
  // Открываем объектный литерал.
  {
    // Обрабатываем конструкцию: id.
    id: "upstream",
    // Обрабатываем конструкцию: labelKey.
    labelKey: "about.upstream",
    // Обрабатываем конструкцию: url.
    url: "https://github.com/Flowseal/zapret-discord-youtube",
    // Закрываем текущий блок.
  },
  // Закрываем массив или список.
];
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const DENSITY_SCALE: Record<DensityMode, number> = {
  // Обрабатываем конструкцию: compact.
  compact: 0.9,
  // Обрабатываем конструкцию: normal.
  normal: 1,
  // Обрабатываем конструкцию: comfy.
  comfy: 1.1,
  // Закрываем текущий блок.
};
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const SETTINGS_SAVED_INDICATOR_MS = 2000;
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const SETTINGS_SECTIONS = [
  // Обрабатываем конструкцию: general.
  "general",
  // Обрабатываем конструкцию: vpn.
  "vpn",
  // Обрабатываем конструкцию: appearance.
  "appearance",
  // Обрабатываем конструкцию: strategies.
  "strategies",
  // Обрабатываем конструкцию: updates.
  "updates",
  // Обрабатываем конструкцию: advanced.
  "advanced",
  // Закрываем массив или список.
] as const satisfies readonly SettingsSection[];
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function isSettingsSection(value: string): value is SettingsSection {
  // Возвращаем результат: (SETTINGS_SECTIONS as readonly string[]).includes(value….
  return (SETTINGS_SECTIONS as readonly string[]).includes(value);
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const SETTINGS_SECTION_ICONS = {
  // Обрабатываем конструкцию: general.
  general: SlidersHorizontal,
  // Обрабатываем конструкцию: vpn.
  vpn: Shield,
  // Обрабатываем конструкцию: appearance.
  appearance: Settings,
  // Обрабатываем конструкцию: strategies.
  strategies: Layers,
  // Обрабатываем конструкцию: updates.
  updates: RefreshCw,
  // Обрабатываем конструкцию: advanced.
  advanced: Activity,
  // Закрываем текущий блок.
} as const satisfies Record<SettingsSection, LucideIcon>;
// — разделитель логических блоков —
