import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import AboutSystemCard from "@/components/about/AboutSystemCard";
import AboutIdentity from "@/components/about/AboutIdentity";
import AboutActions from "@/components/about/AboutActions";
import type { Translate } from "@/i18n";
import { createTranslate } from "@/i18n";
import type { SystemInfo } from "@/types";

const T = createTranslate("ru");

const INFO: SystemInfo = {
  os: "windows",
  osVersion: "11",
  osBuild: "22631",
  arch: "x86_64",
  tauriVersion: "2.0.0",
  rustVersion: "1.80.0",
  appVersion: "0.1.0",
  webviewVersion: "1.0.0",
};

describe("AboutIdentity", () => {
  it("показывает название, версию приложения и версию ресурсов", () => {
    render(
      <AboutIdentity
        appVersion="0.1.0"
        resourcesVersion="1.10.3"
        resourcesLabel="Ресурсы версии"
      />
    );

    expect(
      screen.getByRole("heading", { name: "Zapret Manager" })
    ).toBeTruthy();
    expect(screen.getByText("0.1.0")).toBeTruthy();
    expect(screen.getByText(/1\.10\.3/)).toBeTruthy();
  });
});

describe("AboutSystemCard", () => {
  it("выводит ключевые строки системной информации", () => {
    render(<AboutSystemCard info={INFO} t={T} />);

    expect(screen.getByText("Система")).toBeTruthy();
    expect(screen.getByText("Архитектура")).toBeTruthy();
    expect(screen.getByText("x86_64")).toBeTruthy();
  });

  it("показывает заглушку, пока данные не пришли", () => {
    render(<AboutSystemCard info={null} t={T} />);

    expect(screen.getByText(/Собираем данные о системе/)).toBeTruthy();
    expect(screen.queryByText("Архитектура")).toBeNull();
  });
});

describe("AboutActions", () => {
  const baseProps = {
    canOpenStrategies: true,
    canCopyInfo: true,
    copied: false,
    onCheckUpdates: vi.fn(),
    onOpenFolder: vi.fn(),
    onOpenLicenses: vi.fn(),
    onCopyInfo: vi.fn(),
    t: T,
  };

  it("вызывает обработчики всех действий", async () => {
    const onCheckUpdates = vi.fn();
    const onOpenFolder = vi.fn();
    const onOpenLicenses = vi.fn();
    const onCopyInfo = vi.fn();

    render(
      <AboutActions
        {...baseProps}
        onCheckUpdates={onCheckUpdates}
        onOpenFolder={onOpenFolder}
        onOpenLicenses={onOpenLicenses}
        onCopyInfo={onCopyInfo}
      />
    );

    await userEvent.click(
      screen.getByRole("button", { name: "Проверить обновления" })
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Открыть папку с логами" })
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Открыть папку с конфигом" })
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Открыть папку со стратегиями" })
    );
    await userEvent.click(screen.getByRole("button", { name: "Лицензии" }));
    await userEvent.click(
      screen.getByRole("button", { name: "Скопировать информацию о системе" })
    );

    expect(onCheckUpdates).toHaveBeenCalledTimes(1);
    expect(onOpenFolder).toHaveBeenCalledWith("logs");
    expect(onOpenFolder).toHaveBeenCalledWith("config");
    expect(onOpenFolder).toHaveBeenCalledWith("strategies");
    expect(onOpenLicenses).toHaveBeenCalledTimes(1);
    expect(onCopyInfo).toHaveBeenCalledTimes(1);
  });

  it("блокирует копирование без системной информации", () => {
    render(<AboutActions {...baseProps} canCopyInfo={false} />);

    expect(
      screen.getByRole("button", { name: "Скопировать информацию о системе" })
    ).toBeDisabled();
  });

  it("блокирует открытие папки стратегий, если путь не задан", () => {
    render(<AboutActions {...baseProps} canOpenStrategies={false} />);

    expect(
      screen.getByRole("button", { name: "Открыть папку со стратегиями" })
    ).toBeDisabled();
  });

  it("подтверждает копирование изменённой подписью", () => {
    render(<AboutActions {...baseProps} copied />);

    expect(screen.getByRole("button", { name: "Сохранено" })).toBeTruthy();
  });

  it("показывает рабочую ссылку на upstream zapret", () => {
    render(<AboutActions {...baseProps} />);

    expect(screen.getByText("Ссылки")).toBeTruthy();
    expect(
      screen.getByRole("button", {
        name: "Репозиторий zapret-discord-youtube",
      })
    ).toBeTruthy();
  });
});

describe("Translate", () => {
  it("принимается как пропс системной карточки", () => {
    const t: Translate = T;

    expect(t("about.system")).toBe("Система");
  });
});
