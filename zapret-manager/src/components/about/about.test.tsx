// Импортируем зависимости из модуля @testing-library/react.
import { render, screen } from "@testing-library/react";
// Импортируем зависимости из модуля @testing-library/user-event.
import userEvent from "@testing-library/user-event";
// Импортируем зависимости из модуля vitest.
import { describe, expect, it, vi } from "vitest";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/components/about/AboutSystemCard.
import AboutSystemCard from "@/components/about/AboutSystemCard";
// Импортируем зависимости из модуля @/components/about/AboutIdentity.
import AboutIdentity from "@/components/about/AboutIdentity";
// Импортируем зависимости из модуля @/components/about/AboutActions.
import AboutActions from "@/components/about/AboutActions";
// Импортируем зависимости из модуля @/i18n.
import type { Translate } from "@/i18n";
// Импортируем зависимости из модуля @/i18n.
import { createTranslate } from "@/i18n";
// Импортируем зависимости из модуля @/types.
import type { SystemInfo } from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: const T = createTranslate(ru).
const T = createTranslate("ru");
// — разделитель логических блоков —

// Обрабатываем конструкцию: const INFO: SystemInfo = { os: windows, osVersion: 11, ….
const INFO: SystemInfo = {
  // Обрабатываем конструкцию: os.
  os: "windows",
  // Обрабатываем конструкцию: osVersion.
  osVersion: "11",
  // Обрабатываем конструкцию: osBuild.
  osBuild: "22631",
  // Обрабатываем конструкцию: arch.
  arch: "x86_64",
  // Обрабатываем конструкцию: tauriVersion.
  tauriVersion: "2.0.0",
  // Обрабатываем конструкцию: rustVersion.
  rustVersion: "1.80.0",
  // Обрабатываем конструкцию: appVersion.
  appVersion: "0.1.0",
  // Обрабатываем конструкцию: webviewVersion.
  webviewVersion: "1.0.0",
  // Закрываем текущий блок.
};
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("AboutIdentity", () => {
  // Обрабатываем конструкцию: it.
  it("показывает название, автора, версию приложения и версию ресурсов", () => {
    // Обрабатываем конструкцию: render.
    render(
      // Рендерим самозакрывающийся элемент AboutIdentity.
      <AboutIdentity
        // Обрабатываем конструкцию: appVersion.
        appVersion="0.1.0"
        // Обрабатываем конструкцию: resourcesVersion.
        resourcesVersion="1.10.3"
        // Обрабатываем конструкцию: resourcesLabel.
        resourcesLabel="Ресурсы версии"
        // Продолжаем выражение.
      />
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(screen.getByRole("heading", { name: "Zapret" })).toBeTruthy();
    // Обрабатываем конструкцию: expect.
    expect(screen.getByText("By: Ivan Grafov")).toBeTruthy();
    // Обрабатываем конструкцию: expect.
    expect(screen.getByText("0.1.0")).toBeTruthy();
    // Обрабатываем конструкцию: expect.
    expect(screen.getByText(/1\.10\.3/)).toBeTruthy();
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("AboutSystemCard", () => {
  // Обрабатываем конструкцию: it.
  it("выводит ключевые строки системной информации", () => {
    // Обрабатываем конструкцию: render.
    render(<AboutSystemCard info={INFO} t={T} />);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(screen.getByText("Система")).toBeTruthy();
    // Обрабатываем конструкцию: expect.
    expect(screen.getByText("Архитектура")).toBeTruthy();
    // Обрабатываем конструкцию: expect.
    expect(screen.getByText("x86_64")).toBeTruthy();
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("показывает заглушку, пока данные не пришли", () => {
    // Обрабатываем конструкцию: render.
    render(<AboutSystemCard info={null} t={T} />);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(screen.getByText(/Собираем данные о системе/)).toBeTruthy();
    // Обрабатываем конструкцию: expect.
    expect(screen.queryByText("Архитектура")).toBeNull();
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("AboutActions", () => {
  // Обрабатываем конструкцию: const baseProps = { canOpenStrategies: true, canCopyInf….
  const baseProps = {
    // Обрабатываем конструкцию: canOpenStrategies.
    canOpenStrategies: true,
    // Обрабатываем конструкцию: canCopyInfo.
    canCopyInfo: true,
    // Обрабатываем конструкцию: copied.
    copied: false,
    // Обрабатываем конструкцию: onCheckUpdates.
    onCheckUpdates: vi.fn(),
    // Обрабатываем конструкцию: onOpenFolder.
    onOpenFolder: vi.fn(),
    // Обрабатываем конструкцию: onOpenLicenses.
    onOpenLicenses: vi.fn(),
    // Обрабатываем конструкцию: onCopyInfo.
    onCopyInfo: vi.fn(),
    // Обрабатываем конструкцию: t.
    t: T,
    // Закрываем текущий блок.
  };
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("вызывает обработчики всех действий", async () => {
    // Обрабатываем конструкцию: const onCheckUpdates = vi.fn().
    const onCheckUpdates = vi.fn();
    // Обрабатываем конструкцию: const onOpenFolder = vi.fn().
    const onOpenFolder = vi.fn();
    // Обрабатываем конструкцию: const onOpenLicenses = vi.fn().
    const onOpenLicenses = vi.fn();
    // Обрабатываем конструкцию: const onCopyInfo = vi.fn().
    const onCopyInfo = vi.fn();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: render.
    render(
      // Рендерим самозакрывающийся элемент AboutActions.
      <AboutActions
        // Обрабатываем конструкцию: {...baseProps}.
        {...baseProps}
        // Обрабатываем конструкцию: onCheckUpdates.
        onCheckUpdates={onCheckUpdates}
        // Обрабатываем конструкцию: onOpenFolder.
        onOpenFolder={onOpenFolder}
        // Обрабатываем конструкцию: onOpenLicenses.
        onOpenLicenses={onOpenLicenses}
        // Обрабатываем конструкцию: onCopyInfo.
        onCopyInfo={onCopyInfo}
        // Продолжаем выражение.
      />
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Ожидаем завершение асинхронной операции await userEvent.click( screen.getByRole(butto….
    await userEvent.click(
      // Обрабатываем конструкцию: screen.
      screen.getByRole("button", { name: "Проверить обновления" })
      // Закрываем выражение или список аргументов.
    );
    // Ожидаем завершение асинхронной операции await userEvent.click( screen.getByRole(butto….
    await userEvent.click(
      // Обрабатываем конструкцию: screen.
      screen.getByRole("button", { name: "Открыть папку с логами" })
      // Закрываем выражение или список аргументов.
    );
    // Ожидаем завершение асинхронной операции await userEvent.click( screen.getByRole(butto….
    await userEvent.click(
      // Обрабатываем конструкцию: screen.
      screen.getByRole("button", { name: "Открыть папку с конфигом" })
      // Закрываем выражение или список аргументов.
    );
    // Ожидаем завершение асинхронной операции await userEvent.click( screen.getByRole(butto….
    await userEvent.click(
      // Обрабатываем конструкцию: screen.
      screen.getByRole("button", { name: "Открыть папку со стратегиями" })
      // Закрываем выражение или список аргументов.
    );
    // Ожидаем завершение асинхронной операции await userEvent.click(screen.getByRole(button….
    await userEvent.click(screen.getByRole("button", { name: "Лицензии" }));
    // Ожидаем завершение асинхронной операции await userEvent.click( screen.getByRole(butto….
    await userEvent.click(
      // Обрабатываем конструкцию: screen.
      screen.getByRole("button", { name: "Скопировать информацию о системе" })
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(onCheckUpdates).toHaveBeenCalledTimes(1);
    // Обрабатываем конструкцию: expect.
    expect(onOpenFolder).toHaveBeenCalledWith("logs");
    // Обрабатываем конструкцию: expect.
    expect(onOpenFolder).toHaveBeenCalledWith("config");
    // Обрабатываем конструкцию: expect.
    expect(onOpenFolder).toHaveBeenCalledWith("strategies");
    // Обрабатываем конструкцию: expect.
    expect(onOpenLicenses).toHaveBeenCalledTimes(1);
    // Обрабатываем конструкцию: expect.
    expect(onCopyInfo).toHaveBeenCalledTimes(1);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("блокирует копирование без системной информации", () => {
    // Обрабатываем конструкцию: render.
    render(<AboutActions {...baseProps} canCopyInfo={false} />);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(
      // Обрабатываем конструкцию: screen.
      screen.getByRole("button", { name: "Скопировать информацию о системе" })
      // Закрываем выражение или список аргументов.
    ).toBeDisabled();
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("блокирует открытие папки стратегий, если путь не задан", () => {
    // Обрабатываем конструкцию: render.
    render(<AboutActions {...baseProps} canOpenStrategies={false} />);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(
      // Обрабатываем конструкцию: screen.
      screen.getByRole("button", { name: "Открыть папку со стратегиями" })
      // Закрываем выражение или список аргументов.
    ).toBeDisabled();
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("подтверждает копирование изменённой подписью", () => {
    // Обрабатываем конструкцию: render.
    render(<AboutActions {...baseProps} copied />);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(screen.getByRole("button", { name: "Сохранено" })).toBeTruthy();
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("показывает рабочую ссылку на upstream zapret", () => {
    // Обрабатываем конструкцию: render.
    render(<AboutActions {...baseProps} />);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(screen.getByText("Ссылки")).toBeTruthy();
    // Обрабатываем конструкцию: expect.
    expect(
      // Обрабатываем конструкцию: screen.
      screen.getByRole("button", {
        // Обрабатываем конструкцию: name.
        name: "Репозиторий zapret-discord-youtube",
        // Закрываем текущий блок.
      })
      // Закрываем выражение или список аргументов.
    ).toBeTruthy();
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("Translate", () => {
  // Обрабатываем конструкцию: it.
  it("принимается как пропс системной карточки", () => {
    // Обрабатываем конструкцию: const t: Translate = T.
    const t: Translate = T;
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(t("about.system")).toBe("Система");
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —
