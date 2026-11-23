// Импортируем зависимости из модуля @testing-library/react.
import { render, screen } from "@testing-library/react";
// Импортируем зависимости из модуля @testing-library/user-event.
import userEvent from "@testing-library/user-event";
// Импортируем зависимости из модуля vitest.
import { describe, expect, it, vi } from "vitest";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/components/dashboard/ModeSwitcher.
import ModeSwitcher from "@/components/dashboard/ModeSwitcher";
// Импортируем зависимости из модуля @/components/dashboard/vpn/ConnectButton.
import ConnectButton from "@/components/dashboard/vpn/ConnectButton";
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("ModeSwitcher", () => {
  // Обрабатываем конструкцию: it.
  it("показывает оба режима и отмечает активный", () => {
    // Обрабатываем конструкцию: render.
    render(
      // Рендерим самозакрывающийся элемент ModeSwitcher.
      <ModeSwitcher
        // Обрабатываем конструкцию: mode.
        mode="dpi"
        // Обрабатываем конструкцию: switchStep.
        switchStep={null}
        // Обрабатываем конструкцию: isSwitching.
        isSwitching={false}
        // Обрабатываем конструкцию: onChange.
        onChange={vi.fn()}
        // Продолжаем выражение.
      />
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const group = screen.getByRole(radiogroup).
    const group = screen.getByRole("radiogroup");
    // Обрабатываем конструкцию: const dpi = screen.getByRole(radio, { name: Переключить….
    const dpi = screen.getByRole("radio", { name: "Переключить на обход" });
    // Обрабатываем конструкцию: const vpn = screen.getByRole(radio, { name: Переключить….
    const vpn = screen.getByRole("radio", { name: "Переключить на VPN" });
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(group).toBeTruthy();
    // Обрабатываем конструкцию: expect.
    expect(dpi.getAttribute("aria-checked")).toBe("true");
    // Обрабатываем конструкцию: expect.
    expect(vpn.getAttribute("aria-checked")).toBe("false");
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("вызывает onChange с выбранным режимом", async () => {
    // Обрабатываем конструкцию: const onChange = vi.fn().
    const onChange = vi.fn();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: render.
    render(
      // Рендерим самозакрывающийся элемент ModeSwitcher.
      <ModeSwitcher
        // Обрабатываем конструкцию: mode.
        mode="dpi"
        // Обрабатываем конструкцию: switchStep.
        switchStep={null}
        // Обрабатываем конструкцию: isSwitching.
        isSwitching={false}
        // Обрабатываем конструкцию: onChange.
        onChange={onChange}
        // Продолжаем выражение.
      />
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Ожидаем завершение асинхронной операции await userEvent.click( screen.getByRole(radio….
    await userEvent.click(
      // Обрабатываем конструкцию: screen.
      screen.getByRole("radio", { name: "Переключить на VPN" })
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(onChange).toHaveBeenCalledWith("vpn");
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("блокируется на время переключения", () => {
    // Обрабатываем конструкцию: render.
    render(
      // Рендерим самозакрывающийся элемент ModeSwitcher.
      <ModeSwitcher
        // Обрабатываем конструкцию: mode.
        mode="dpi"
        // Обрабатываем конструкцию: switchStep.
        switchStep="stopping-dpi"
        // Задаём атрибут isSwitching элемента.
        isSwitching
        // Обрабатываем конструкцию: onChange.
        onChange={vi.fn()}
        // Продолжаем выражение.
      />
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(
      // Обрабатываем конструкцию: screen.
      screen.getByRole("radio", { name: "Переключить на VPN" })
      // Закрываем выражение или список аргументов.
    ).toBeDisabled();
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("показывает текущий режим в подписи", () => {
    // Обрабатываем конструкцию: const { rerender } = render( <ModeSwitcher mode=vpn swi….
    const { rerender } = render(
      // Рендерим самозакрывающийся элемент ModeSwitcher.
      <ModeSwitcher
        // Обрабатываем конструкцию: mode.
        mode="vpn"
        // Обрабатываем конструкцию: switchStep.
        switchStep={null}
        // Обрабатываем конструкцию: isSwitching.
        isSwitching={false}
        // Обрабатываем конструкцию: onChange.
        onChange={vi.fn()}
        // Продолжаем выражение.
      />
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(screen.getByText("Режим: VPN")).toBeTruthy();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: rerender.
    rerender(
      // Рендерим самозакрывающийся элемент ModeSwitcher.
      <ModeSwitcher
        // Обрабатываем конструкцию: mode.
        mode="dpi"
        // Обрабатываем конструкцию: switchStep.
        switchStep={null}
        // Обрабатываем конструкцию: isSwitching.
        isSwitching={false}
        // Обрабатываем конструкцию: onChange.
        onChange={vi.fn()}
        // Продолжаем выражение.
      />
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(screen.getByText("Режим: обход DPI")).toBeTruthy();
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("ConnectButton", () => {
  // Обрабатываем конструкцию: const base = { connecting: false, isSwitching: false, s….
  const base = {
    // Обрабатываем конструкцию: connecting.
    connecting: false,
    // Обрабатываем конструкцию: isSwitching.
    isSwitching: false,
    // Обрабатываем конструкцию: switchStep.
    switchStep: null,
    // Обрабатываем конструкцию: activeServerName.
    activeServerName: "Амстердам",
    // Обрабатываем конструкцию: onClick.
    onClick: vi.fn(),
    // Закрываем текущий блок.
  };
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("приглашает подключиться в покое", () => {
    // Обрабатываем конструкцию: render.
    render(<ConnectButton connected={false} {...base} />);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(screen.getByText("Нажмите для подключения")).toBeTruthy();
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("показывает имя активного сервера", () => {
    // Обрабатываем конструкцию: render.
    render(<ConnectButton connected {...base} />);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(screen.getByText("Подключено к Амстердам")).toBeTruthy();
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("переключает надпись на подключение", async () => {
    // Обрабатываем конструкцию: const onClick = vi.fn().
    const onClick = vi.fn();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: render.
    render(<ConnectButton connected={false} {...base} onClick={onClick} />);
    // — разделитель логических блоков —

    // Ожидаем завершение асинхронной операции await userEvent.click( screen.getByRole(butto….
    await userEvent.click(
      // Обрабатываем конструкцию: screen.
      screen.getByRole("button", { name: "Подключить VPN" })
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(onClick).toHaveBeenCalledTimes(1);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("меняет aria-label при подключении", () => {
    // Обрабатываем конструкцию: render.
    render(<ConnectButton connected {...base} />);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(screen.getByRole("button", { name: "Отключить VPN" })).toBeTruthy();
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("помечает busy при подключении", () => {
    // Обрабатываем конструкцию: render.
    render(<ConnectButton connected={false} {...base} connecting />);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(
      // Обрабатываем конструкцию: screen.
      screen.getByRole("button", { name: "Подключить VPN" })
      // Закрываем выражение или список аргументов.
    ).toHaveAttribute("aria-busy", "true");
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —
