import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import ModeSwitcher from "@/components/dashboard/ModeSwitcher";
import ConnectButton from "@/components/dashboard/vpn/ConnectButton";
import ActionsRow from "@/components/dashboard/vpn/ActionsRow";
import ServerCard from "@/components/dashboard/vpn/ServerCard";
import type { VpnConfigInfo } from "@/types";

const CONFIG: VpnConfigInfo = {
  id: "nl1",
  name: "Амстердам 🇳🇱",
  path: "C:/vpn/nl1.conf",
  endpoint: "node.amsterdam.nl:51820",
  address: ["10.0.0.2/32"],
  dns: ["1.1.1.1"],
  allowedIps: ["0.0.0.0/0"],
  size: 320,
  importedAt: 5,
};

describe("ModeSwitcher", () => {
  it("показывает оба режима и отмечает активный", () => {
    render(
      <ModeSwitcher
        mode="dpi"
        switchStep={null}
        isSwitching={false}
        onChange={vi.fn()}
      />
    );

    const group = screen.getByRole("radiogroup");
    const dpi = screen.getByRole("radio", { name: "Переключить на обход" });
    const vpn = screen.getByRole("radio", { name: "Переключить на VPN" });

    expect(group).toBeTruthy();
    expect(dpi.getAttribute("aria-checked")).toBe("true");
    expect(vpn.getAttribute("aria-checked")).toBe("false");
  });

  it("вызывает onChange с выбранным режимом", async () => {
    const onChange = vi.fn();

    render(
      <ModeSwitcher
        mode="dpi"
        switchStep={null}
        isSwitching={false}
        onChange={onChange}
      />
    );

    await userEvent.click(
      screen.getByRole("radio", { name: "Переключить на VPN" })
    );

    expect(onChange).toHaveBeenCalledWith("vpn");
  });

  it("блокируется на время переключения", () => {
    render(
      <ModeSwitcher
        mode="dpi"
        switchStep="stopping-dpi"
        isSwitching
        onChange={vi.fn()}
      />
    );

    expect(
      screen.getByRole("radio", { name: "Переключить на VPN" })
    ).toBeDisabled();
  });

  it("показывает текущий режим в подписи", () => {
    const { rerender } = render(
      <ModeSwitcher
        mode="vpn"
        switchStep={null}
        isSwitching={false}
        onChange={vi.fn()}
      />
    );

    expect(screen.getByText("Режим: VPN")).toBeTruthy();

    rerender(
      <ModeSwitcher
        mode="dpi"
        switchStep={null}
        isSwitching={false}
        onChange={vi.fn()}
      />
    );

    expect(screen.getByText("Режим: обход DPI")).toBeTruthy();
  });
});

describe("ConnectButton", () => {
  const base = {
    isSwitching: false,
    switchStep: null,
    activeServerName: "Амстердам",
    onClick: vi.fn(),
  };

  it("приглашает подключиться в покое", () => {
    render(<ConnectButton status="disconnected" {...base} />);

    expect(screen.getByText("Нажмите для подключения")).toBeTruthy();
  });

  it("показывает имя активного сервера", () => {
    render(<ConnectButton status="connected" {...base} />);

    expect(screen.getByText("Подключено к Амстердам")).toBeTruthy();
  });

  it("сообщает об ошибке", () => {
    render(<ConnectButton status="error" {...base} />);

    expect(screen.getByText("Ошибка подключения")).toBeTruthy();
  });

  it("переключает надпись на подключение", async () => {
    const onClick = vi.fn();

    render(<ConnectButton status="disconnected" {...base} onClick={onClick} />);

    await userEvent.click(
      screen.getByRole("button", { name: "Подключить VPN" })
    );

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("меняет aria-label при подключении", () => {
    render(<ConnectButton status="connected" {...base} />);

    expect(screen.getByRole("button", { name: "Отключить VPN" })).toBeTruthy();
  });

  it("помечает busy при подключении", () => {
    render(<ConnectButton status="connecting" {...base} />);

    expect(
      screen.getByRole("button", { name: "Подключить VPN" })
    ).toHaveAttribute("aria-busy", "true");
  });
});

describe("ActionsRow", () => {
  it("вызывает все три обработчика", async () => {
    const onAddFile = vi.fn();
    const onPaste = vi.fn();
    const onOpenSettings = vi.fn();

    render(
      <ActionsRow
        disabled={false}
        onAddFile={onAddFile}
        onPaste={onPaste}
        onOpenSettings={onOpenSettings}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: "Добавить" }));
    await userEvent.click(screen.getByRole("button", { name: "Вставить" }));
    await userEvent.click(
      screen.getByRole("button", { name: "Настройки VPN" })
    );

    expect(onAddFile).toHaveBeenCalledTimes(1);
    expect(onPaste).toHaveBeenCalledTimes(1);
    expect(onOpenSettings).toHaveBeenCalledTimes(1);
  });

  it("блокирует действия при занятости", () => {
    render(
      <ActionsRow
        disabled
        onAddFile={vi.fn()}
        onPaste={vi.fn()}
        onOpenSettings={vi.fn()}
      />
    );

    expect(screen.getByRole("button", { name: "Добавить" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Вставить" })).toBeDisabled();
  });
});

describe("ServerCard", () => {
  it("показывает имя, endpoint и флаг страны", () => {
    render(
      <ul>
        <ServerCard
          config={CONFIG}
          isActive={false}
          ping={61}
          onSelect={vi.fn()}
          onOpenMenu={vi.fn()}
        />
      </ul>
    );

    expect(screen.getByText("Амстердам 🇳🇱")).toBeTruthy();
    expect(screen.getByText("node.amsterdam.nl:51820")).toBeTruthy();
    expect(screen.getByText("61 мс")).toBeTruthy();
    expect(screen.getByAltText("NL")).toBeTruthy();
  });

  it("показывает прочерк при отсутствии пинга", () => {
    render(
      <ul>
        <ServerCard
          config={CONFIG}
          isActive={false}
          ping={null}
          onSelect={vi.fn()}
          onOpenMenu={vi.fn()}
        />
      </ul>
    );

    expect(screen.getByText("—")).toBeTruthy();
  });

  it("подключается по клику на тело карточки", async () => {
    const onSelect = vi.fn();

    render(
      <ul>
        <ServerCard
          config={CONFIG}
          isActive={false}
          ping={null}
          onSelect={onSelect}
          onOpenMenu={vi.fn()}
        />
      </ul>
    );

    await userEvent.click(
      screen.getByRole("button", {
        name: "Подключиться к серверу Амстердам 🇳🇱",
      })
    );

    expect(onSelect).toHaveBeenCalledWith("nl1");
  });

  it("открывает меню по кнопке с точками", async () => {
    const onOpenMenu = vi.fn();

    render(
      <ul>
        <ServerCard
          config={CONFIG}
          isActive={false}
          ping={null}
          onSelect={vi.fn()}
          onOpenMenu={onOpenMenu}
        />
      </ul>
    );

    await userEvent.click(
      screen.getByRole("button", {
        name: "Действия со списком серверов: Амстердам 🇳🇱",
      })
    );

    expect(onOpenMenu).toHaveBeenCalledWith("nl1");
  });

  it("подставляет глобус при неизвестной стране", () => {
    render(
      <ul>
        <ServerCard
          config={{ ...CONFIG, endpoint: "vpn.acme.internal:51820" }}
          isActive={false}
          ping={null}
          onSelect={vi.fn()}
          onOpenMenu={vi.fn()}
        />
      </ul>
    );

    expect(screen.queryByAltText("NL")).toBeNull();
    expect(
      screen.getByRole("button", {
        name: "Подключиться к серверу Амстердам 🇳🇱",
      })
    ).toBeTruthy();
  });
});
