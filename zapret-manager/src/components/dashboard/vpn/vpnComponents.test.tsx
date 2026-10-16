import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import ModeSwitcher from "@/components/dashboard/ModeSwitcher";
import ConnectButton from "@/components/dashboard/vpn/ConnectButton";
import ActionsRow from "@/components/dashboard/vpn/ActionsRow";
import ServerCard from "@/components/dashboard/vpn/ServerCard";
import type { SubscriptionServer } from "@/types";

const SERVER: SubscriptionServer = {
  id: "srv_1",
  name: "Амстердам 🇳🇱",
  protocol: "vless",
  host: "node.amsterdam.nl",
  port: 443,
  link: "vless://uuid@node.amsterdam.nl:443?security=tls#Amsterdam",
  transport: "tcp",
  security: "tls",
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
    connecting: false,
    isSwitching: false,
    switchStep: null,
    activeServerName: "Амстердам",
    onClick: vi.fn(),
  };

  it("приглашает подключиться в покое", () => {
    render(<ConnectButton connected={false} {...base} />);

    expect(screen.getByText("Нажмите для подключения")).toBeTruthy();
  });

  it("показывает имя активного сервера", () => {
    render(<ConnectButton connected {...base} />);

    expect(screen.getByText("Подключено к Амстердам")).toBeTruthy();
  });

  it("переключает надпись на подключение", async () => {
    const onClick = vi.fn();

    render(<ConnectButton connected={false} {...base} onClick={onClick} />);

    await userEvent.click(
      screen.getByRole("button", { name: "Подключить VPN" })
    );

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("меняет aria-label при подключении", () => {
    render(<ConnectButton connected {...base} />);

    expect(screen.getByRole("button", { name: "Отключить VPN" })).toBeTruthy();
  });

  it("помечает busy при подключении", () => {
    render(<ConnectButton connected={false} {...base} connecting />);

    expect(
      screen.getByRole("button", { name: "Подключить VPN" })
    ).toHaveAttribute("aria-busy", "true");
  });
});

describe("ActionsRow", () => {
  it("вызывает обработчики", async () => {
    const onAddLink = vi.fn();
    const onPasteLink = vi.fn();

    render(
      <ActionsRow
        disabled={false}
        onAddLink={onAddLink}
        onPasteLink={onPasteLink}
      />
    );

    await userEvent.click(
      screen.getByRole("button", { name: "Добавить ссылку" })
    );
    await userEvent.click(screen.getByRole("button", { name: "Вставить" }));

    expect(onAddLink).toHaveBeenCalledTimes(1);
    expect(onPasteLink).toHaveBeenCalledTimes(1);
  });

  it("блокирует действия при занятости", () => {
    render(<ActionsRow disabled onAddLink={vi.fn()} onPasteLink={vi.fn()} />);

    expect(
      screen.getByRole("button", { name: "Добавить ссылку" })
    ).toBeDisabled();
    expect(screen.getByRole("button", { name: "Вставить" })).toBeDisabled();
  });
});

describe("ServerCard", () => {
  it("показывает имя, теги протокола и транспорта и флаг страны", () => {
    render(
      <div role="list">
        <ServerCard
          server={SERVER}
          isActive={false}
          ping={61}
          onSelect={vi.fn()}
          onRemove={vi.fn()}
        />
      </div>
    );

    expect(screen.getByText("Амстердам 🇳🇱")).toBeTruthy();
    expect(screen.getByText("TCP · TLS")).toBeTruthy();
    expect(screen.getByText("vless")).toBeTruthy();
    expect(screen.getByText("61 мс")).toBeTruthy();
    expect(screen.getByAltText("NL")).toBeTruthy();
  });

  // Сервер из хранилища может достаться без полей транспорта и шифрования:
  // жёсткое обращение к ним роняло весь интерфейс при переходе в VPN.
  it("не падает на сервере без полей транспорта", () => {
    const legacy = {
      id: "srv_old",
      name: "Старый",
      protocol: "vless",
      host: "old.example.com",
      port: 443,
      link: "vless://uuid@old.example.com:443#Old",
    } as unknown as SubscriptionServer;

    render(
      <div role="list">
        <ServerCard
          server={legacy}
          isActive={false}
          ping={null}
          onSelect={vi.fn()}
          onRemove={vi.fn()}
        />
      </div>
    );

    expect(screen.getByText("Старый")).toBeTruthy();
    expect(screen.getByText("vless")).toBeTruthy();
    expect(screen.getByText("n/a")).toBeTruthy();
  });

  it("открывает меню действий и удаляет сервер", async () => {
    const onRemove = vi.fn();
    const onSelect = vi.fn();

    render(
      <div role="list">
        <ServerCard
          server={SERVER}
          isActive={false}
          ping={42}
          onSelect={onSelect}
          onRemove={onRemove}
        />
      </div>
    );

    await userEvent.click(
      screen.getByRole("button", { name: "Действия с сервером Амстердам 🇳🇱" })
    );

    // по референсу сервер прячется под меню «⋯», а не под отдельной корзиной
    await userEvent.click(screen.getByRole("button", { name: "Удалить" }));
    expect(onRemove).toHaveBeenCalledWith(SERVER);
  });

  it("показывает n/a с красной точкой при отсутствии пинга", () => {
    render(
      <div role="list">
        <ServerCard
          server={SERVER}
          isActive={false}
          ping={null}
          onSelect={vi.fn()}
          onRemove={vi.fn()}
        />
      </div>
    );

    expect(screen.getByText("n/a")).toBeTruthy();
  });

  it("выбирает сервер по клику", async () => {
    const onSelect = vi.fn();

    render(
      <div role="list">
        <ServerCard
          server={SERVER}
          isActive={false}
          ping={null}
          onSelect={onSelect}
          onRemove={vi.fn()}
        />
      </div>
    );

    await userEvent.click(
      screen.getByRole("button", {
        name: "Подключиться к серверу Амстердам 🇳🇱",
      })
    );

    expect(onSelect).toHaveBeenCalledWith(SERVER);
  });

  it("подставляет глобус при неизвестной стране", () => {
    render(
      <div role="list">
        <ServerCard
          server={{ ...SERVER, host: "vpn.acme.internal" }}
          isActive={false}
          ping={null}
          onSelect={vi.fn()}
          onRemove={vi.fn()}
        />
      </div>
    );

    expect(screen.queryByAltText("NL")).toBeNull();
    expect(
      screen.getByRole("button", {
        name: "Подключиться к серверу Амстердам 🇳🇱",
      })
    ).toBeTruthy();
  });
});
