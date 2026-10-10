import {
  SETTINGS_SECTION_ICONS,
  SETTINGS_SECTIONS,
} from "@/lib/settingsConstants";
import { cn } from "@/lib/utils";
import type { SettingsSection } from "@/types";

import type { Translate } from "@/i18n";

export interface SettingsNavProps {
  active: SettingsSection;
  onChange: (section: SettingsSection) => void;
  t: Translate;
}

function SettingsNav({ active, onChange, t }: SettingsNavProps) {
  return (
    <nav
      aria-label={t("settings.sections.general")}
      className={cn(
        "flex gap-1 md:sticky md:top-0 md:flex-col",
        "md:w-52 md:shrink-0",
        "-mx-1 scrollbar-none flex-row overflow-x-auto px-1 pb-2"
      )}
    >
      {SETTINGS_SECTIONS.map((section) => {
        const Icon = SETTINGS_SECTION_ICONS[section];
        const selected = section === active;

        return (
          <button
            key={section}
            type="button"
            aria-current={selected ? "page" : undefined}
            onClick={() => {
              onChange(section);
            }}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-left text-sm",
              "transition-colors duration-200 ease-out",
              selected
                ? "text-text-primary bg-glass-hover"
                : "text-text-secondary hover:text-text-primary hover:bg-glass-hover"
            )}
          >
            <Icon
              aria-hidden="true"
              className={cn(
                "size-4 shrink-0",
                selected && "text-accent-primary"
              )}
              strokeWidth={2}
            />
            <span className="whitespace-nowrap">
              {t(`settings.sections.${section}`)}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

export default SettingsNav;
