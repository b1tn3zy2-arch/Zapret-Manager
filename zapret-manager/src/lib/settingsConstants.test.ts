import { describe, expect, it } from "vitest";

import { SETTINGS_SECTIONS, isSettingsSection } from "@/lib/settingsConstants";

describe("SETTINGS_SECTIONS", () => {
  it("не содержит удалённую секцию about", () => {
    expect(SETTINGS_SECTIONS).not.toContain("about");
  });

  it("содержит пять секций в ожидаемом порядке", () => {
    expect(SETTINGS_SECTIONS).toEqual([
      "general",
      "appearance",
      "strategies",
      "updates",
      "advanced",
    ]);
  });

  it("не содержит удалённые vpn и games", () => {
    expect(SETTINGS_SECTIONS).not.toContain("vpn");
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
    expect(isSettingsSection("vpn")).toBe(false);
    expect(isSettingsSection("games")).toBe(false);
  });

  it("отклоняет неизвестные значения", () => {
    expect(isSettingsSection("proxy")).toBe(false);
    expect(isSettingsSection("")).toBe(false);
  });
});
