import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  invoke: vi.fn(),
  emit: vi.fn(),
  hide: vi.fn(),
}));

const { invoke: invokeMock, emit: emitMock, hide: hideMock } = mocks;

vi.mock("@tauri-apps/api/core", () => ({ invoke: mocks.invoke }));
vi.mock("@tauri-apps/api/event", () => ({ emit: mocks.emit }));
vi.mock("@tauri-apps/api/window", () => ({
  getCurrentWindow: () => ({
    hide: mocks.hide,
    onFocusChanged: () => Promise.resolve(() => undefined),
  }),
}));

import TrayMenuRoot from "@/tray/TrayMenuRoot";
import { useAppStore } from "@/stores/useAppStore";
import { ROUTES } from "@/lib/constants";

describe("меню трея", () => {
  beforeEach(() => {
    invokeMock.mockClear();
    emitMock.mockClear();
    hideMock.mockClear();
  });

  it("показывает название и статус", () => {
    render(<TrayMenuRoot />);

    expect(screen.getByText("Zapret Manager")).toBeTruthy();
    expect(screen.getByText("Запустить последнюю стратегию")).toBeTruthy();
    expect(screen.getByText("Выход")).toBeTruthy();
  });

  it("запускает последнюю стратегию и закрывает окно", async () => {
    render(<TrayMenuRoot />);

    await userEvent.click(
      screen.getByRole("button", { name: "Запустить последнюю стратегию" })
    );

    expect(emitMock).toHaveBeenCalledWith("tray-quick-run");
    expect(hideMock).toHaveBeenCalled();
  });

  it("останавливает стратегию", async () => {
    render(<TrayMenuRoot />);

    await userEvent.click(screen.getByRole("button", { name: "Остановить" }));

    expect(emitMock).toHaveBeenCalledWith("tray-stop-strategy");
  });

  it("проверяет обновления", async () => {
    render(<TrayMenuRoot />);

    await userEvent.click(
      screen.getByRole("button", { name: "Проверить обновления" })
    );

    expect(emitMock).toHaveBeenCalledWith("tray-check-updates");
  });

  it("переходит к разделу и показывает окно", async () => {
    render(<TrayMenuRoot />);

    await userEvent.click(screen.getByRole("button", { name: "Стратегии" }));

    expect(emitMock).toHaveBeenCalledWith("navigate-strategies");
    expect(invokeMock).toHaveBeenCalledWith("show_tray_window");
    expect(hideMock).toHaveBeenCalled();
  });

  it("завершает приложение из меню", async () => {
    render(<TrayMenuRoot />);

    await userEvent.click(screen.getByRole("button", { name: "Выход" }));

    expect(invokeMock).toHaveBeenCalledWith("quit_app");
  });

  it("показывает статус отключения в подписи и бейдже", () => {
    useAppStore.setState({ activePage: ROUTES.dashboard });

    render(<TrayMenuRoot />);

    expect(screen.getAllByText("Отключено")).toHaveLength(2);
    expect(screen.queryByText("Активно")).toBeNull();
  });
});