import { describe, expect, it } from "vitest";

import { SETTINGS_SECTIONS, isSettingsSection } from "@/lib/settingsConstants";

describe("SETTINGS_SECTIONS", () => {
  it("не содержит удалённую секцию about", () => {
    expect(SETTINGS_SECTIONS).not.toContain("about");
  });

  // Настройки VPN переехали с главной страницы в приложение: раздел вернулся,
  // но по-прежнему шестой в списке, а не первым.
  it("содержит шесть секций в ожидаемом порядке", () => {
    expect(SETTINGS_SECTIONS).toEqual([
      "general",
      "vpn",
      "appearance",
      "strategies",
      "updates",
      "advanced",
    ]);
  });

  it("не содержит удалённые games и outlast", () => {
    expect(SETTINGS_SECTIONS).not.toContain("games");
    expect(SETTINGS_SECTIONS).not.toContain("outlast");
  });

  it("не содержит повторов", () => {
    expect(new Set(SETTINGS_SECTIONS).size).toBe(SETTINGS_SECTIONS.length);
  });
});

describe("isSettingsSection", () => {
  it("принимает все секции из списка", () => {
    for (const section of SETTINGS_SECTIONS) {
      expect(isSettingsSection(section)).toBe(true);
    }
  });

  it("отклоняет удалённые секции", () => {
    expect(isSettingsSection("about")).toBe(false);
    expect(isSettingsSection("outlast")).toBe(false);
    expect(isSettingsSection("games")).toBe(false);
  });

  it("отклоняет неизвестные значения", () => {
    expect(isSettingsSection("proxy")).toBe(false);
    expect(isSettingsSection("")).toBe(false);
  });
});
