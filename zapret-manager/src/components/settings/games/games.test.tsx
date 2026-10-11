import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import AddGameButton from "@/components/settings/games/AddGameButton";
import GameCard from "@/components/settings/games/GameCard";
import type { GameSettings } from "@/types";

function game(patch: Partial<GameSettings> = {}): GameSettings {
  return {
    id: "outlast-trials",
    name: "Outlast Trials",
    icon: "Gamepad2",
    enabled: false,
    builtin: true,
    domains: ["outlasttrials.com", "steampowered.com"],
    ipRanges: [],
    ports: [27015],
    autoRestore: true,
    createBackup: true,
    createdAt: 0,
    ...patch,
  };
}

const handlers = {
  onToggleExpand: vi.fn(),
  onToggleEnabled: vi.fn(),
  onChange: vi.fn(),
  onDelete: vi.fn(),
  onImport: vi.fn(),
  onExport: vi.fn(),
};

describe("AddGameButton", () => {
  it("вызывает обработчик", async () => {
    const onClick = vi.fn();

    render(<AddGameButton disabled={false} onClick={onClick} />);

    await userEvent.click(
      screen.getByRole("button", { name: "Добавить игру" })
    );

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("блокируется при достижении лимита", () => {
    render(<AddGameButton disabled onClick={vi.fn()} />);

    expect(
      screen.getByRole("button", { name: "Добавить игру" })
    ).toBeDisabled();
  });
});

describe("GameCard", () => {
  it("показывает название, статистику и бейдж приоритета", () => {
    render(<GameCard game={game()} expanded={false} {...handlers} />);

    expect(screen.getByText("Outlast Trials")).toBeTruthy();
    expect(screen.getByText("2 домена · 0 IP · 1 порт")).toBeTruthy();
  });

  it("не показывает удаление для встроенной игры", () => {
    render(<GameCard game={game()} expanded={false} {...handlers} />);

    expect(screen.queryByLabelText(/Удалить игру/)).toBeNull();
  });

  it("показывает удаление для своей игры", async () => {
    const onDelete = vi.fn();

    render(
      <GameCard
        game={game({
          id: "my-game",
          name: "Моя игра",
          builtin: false,
        })}
        expanded={false}
        {...handlers}
        onDelete={onDelete}
      />
    );

    const button = screen.getByLabelText("Удалить игру Моя игра");

    await userEvent.click(button);

    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it("разворачивает редактор по клику", async () => {
    const onToggleExpand = vi.fn();

    render(
      <GameCard
        game={game()}
        expanded={false}
        {...handlers}
        onToggleExpand={onToggleExpand}
      />
    );

    await userEvent.click(
      screen.getByRole("button", { name: "Показать настройки игры" })
    );

    expect(onToggleExpand).toHaveBeenCalledTimes(1);
  });

  it("переключает активность игры", async () => {
    const onToggleEnabled = vi.fn();

    render(
      <GameCard
        game={game()}
        expanded={false}
        {...handlers}
        onToggleEnabled={onToggleEnabled}
      />
    );

    await userEvent.click(
      screen.getByRole("switch", { name: "Инъекция для Outlast Trials" })
    );

    expect(onToggleEnabled).toHaveBeenCalledWith(true);
  });

  it("рисует редактор в раскрытом состоянии", () => {
    render(<GameCard game={game()} expanded {...handlers} />);

    expect(screen.getByLabelText("Название")).toBeTruthy();
    expect(screen.getByText("Домены")).toBeTruthy();
    expect(screen.getByText("Порты")).toBeTruthy();
  });

  it("передаёт правки вверх", async () => {
    const onChange = vi.fn();

    render(
      <GameCard game={game()} expanded {...handlers} onChange={onChange} />
    );

    const input = screen.getByLabelText("Название");

    await userEvent.clear(input);
    await userEvent.type(input, "X");

    expect(onChange).toHaveBeenCalled();
  });
});
