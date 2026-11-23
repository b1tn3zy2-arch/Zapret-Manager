// Импортируем зависимости из модуля @testing-library/react.
import { render, screen } from "@testing-library/react";
// Импортируем зависимости из модуля @testing-library/user-event.
import userEvent from "@testing-library/user-event";
// Импортируем зависимости из модуля vitest.
import { describe, expect, it, vi } from "vitest";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/components/settings/games/AddGameButton.
import AddGameButton from "@/components/settings/games/AddGameButton";
// Импортируем зависимости из модуля @/components/settings/games/GameCard.
import GameCard from "@/components/settings/games/GameCard";
// Импортируем зависимости из модуля @/types.
import type { GameSettings } from "@/types";
// — разделитель логических блоков —

// Объявляем функцию game.
function game(patch: Partial<GameSettings> = {}): GameSettings {
  // Возвращаем результат: { id: outlast-trials, name: Outlast Trials, icon: Gamep….
  return {
    // Обрабатываем конструкцию: id.
    id: "outlast-trials",
    // Обрабатываем конструкцию: name.
    name: "Outlast Trials",
    // Обрабатываем конструкцию: icon.
    icon: "Gamepad2",
    // Обрабатываем конструкцию: enabled.
    enabled: false,
    // Обрабатываем конструкцию: builtin.
    builtin: true,
    // Обрабатываем конструкцию: domains.
    domains: ["outlasttrials.com", "steampowered.com"],
    // Обрабатываем конструкцию: ipRanges.
    ipRanges: [],
    // Обрабатываем конструкцию: ports.
    ports: [27015],
    // Обрабатываем конструкцию: autoRestore.
    autoRestore: true,
    // Обрабатываем конструкцию: createBackup.
    createBackup: true,
    // Обрабатываем конструкцию: createdAt.
    createdAt: 0,
    // Разворачиваем ...patch в коллекцию.
    ...patch,
    // Закрываем текущий блок.
  };
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: const handlers = { onToggleExpand: vi.fn(), onToggleEna….
const handlers = {
  // Обрабатываем конструкцию: onToggleExpand.
  onToggleExpand: vi.fn(),
  // Обрабатываем конструкцию: onToggleEnabled.
  onToggleEnabled: vi.fn(),
  // Обрабатываем конструкцию: onChange.
  onChange: vi.fn(),
  // Обрабатываем конструкцию: onDelete.
  onDelete: vi.fn(),
  // Обрабатываем конструкцию: onImport.
  onImport: vi.fn(),
  // Обрабатываем конструкцию: onExport.
  onExport: vi.fn(),
  // Закрываем текущий блок.
};
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("AddGameButton", () => {
  // Обрабатываем конструкцию: it.
  it("вызывает обработчик", async () => {
    // Обрабатываем конструкцию: const onClick = vi.fn().
    const onClick = vi.fn();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: render.
    render(<AddGameButton disabled={false} onClick={onClick} />);
    // — разделитель логических блоков —

    // Ожидаем завершение асинхронной операции await userEvent.click( screen.getByRole(butto….
    await userEvent.click(
      // Обрабатываем конструкцию: screen.
      screen.getByRole("button", { name: "Добавить игру" })
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(onClick).toHaveBeenCalledTimes(1);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("блокируется при достижении лимита", () => {
    // Обрабатываем конструкцию: render.
    render(<AddGameButton disabled onClick={vi.fn()} />);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(
      // Обрабатываем конструкцию: screen.
      screen.getByRole("button", { name: "Добавить игру" })
      // Закрываем выражение или список аргументов.
    ).toBeDisabled();
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("GameCard", () => {
  // Обрабатываем конструкцию: it.
  it("показывает название, статистику и бейдж приоритета", () => {
    // Обрабатываем конструкцию: render.
    render(<GameCard game={game()} expanded={false} {...handlers} />);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(screen.getByText("Outlast Trials")).toBeTruthy();
    // Обрабатываем конструкцию: expect.
    expect(screen.getByText("2 домена · 0 IP · 1 порт")).toBeTruthy();
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("показывает удаление и для встроенной игры", () => {
    // Обрабатываем конструкцию: render.
    render(<GameCard game={game()} expanded={false} {...handlers} />);
    // — разделитель логических блоков —

    // Сохраняем пояснение разработчика: // раньше у встроенных игр кнопки удаления не было вовсе
    // раньше у встроенных игр кнопки удаления не было вовсе
    // Обрабатываем конструкцию: expect.
    expect(screen.getByLabelText("Удалить игру Outlast Trials")).toBeTruthy();
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("показывает удаление для своей игры", async () => {
    // Обрабатываем конструкцию: const onDelete = vi.fn().
    const onDelete = vi.fn();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: render.
    render(
      // Рендерим самозакрывающийся элемент GameCard.
      <GameCard
        // Обрабатываем конструкцию: game.
        game={game({
          // Обрабатываем конструкцию: id.
          id: "my-game",
          // Обрабатываем конструкцию: name.
          name: "Моя игра",
          // Обрабатываем конструкцию: builtin.
          builtin: false,
          // Закрываем текущий блок.
        })}
        // Обрабатываем конструкцию: expanded.
        expanded={false}
        // Обрабатываем конструкцию: {...handlers}.
        {...handlers}
        // Обрабатываем конструкцию: onDelete.
        onDelete={onDelete}
        // Продолжаем выражение.
      />
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const button = screen.getByLabelText(Удалить игру Моя и….
    const button = screen.getByLabelText("Удалить игру Моя игра");
    // — разделитель логических блоков —

    // Ожидаем завершение асинхронной операции await userEvent.click(button).
    await userEvent.click(button);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(onDelete).toHaveBeenCalledTimes(1);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("разворачивает редактор по клику", async () => {
    // Обрабатываем конструкцию: const onToggleExpand = vi.fn().
    const onToggleExpand = vi.fn();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: render.
    render(
      // Рендерим самозакрывающийся элемент GameCard.
      <GameCard
        // Обрабатываем конструкцию: game.
        game={game()}
        // Обрабатываем конструкцию: expanded.
        expanded={false}
        // Обрабатываем конструкцию: {...handlers}.
        {...handlers}
        // Обрабатываем конструкцию: onToggleExpand.
        onToggleExpand={onToggleExpand}
        // Продолжаем выражение.
      />
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Ожидаем завершение асинхронной операции await userEvent.click( screen.getByRole(butto….
    await userEvent.click(
      // Обрабатываем конструкцию: screen.
      screen.getByRole("button", { name: "Показать настройки игры" })
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(onToggleExpand).toHaveBeenCalledTimes(1);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("переключает активность игры", async () => {
    // Обрабатываем конструкцию: const onToggleEnabled = vi.fn().
    const onToggleEnabled = vi.fn();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: render.
    render(
      // Рендерим самозакрывающийся элемент GameCard.
      <GameCard
        // Обрабатываем конструкцию: game.
        game={game()}
        // Обрабатываем конструкцию: expanded.
        expanded={false}
        // Обрабатываем конструкцию: {...handlers}.
        {...handlers}
        // Обрабатываем конструкцию: onToggleEnabled.
        onToggleEnabled={onToggleEnabled}
        // Продолжаем выражение.
      />
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Ожидаем завершение асинхронной операции await userEvent.click( screen.getByRole(switc….
    await userEvent.click(
      // Обрабатываем конструкцию: screen.
      screen.getByRole("switch", { name: "Инъекция для Outlast Trials" })
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(onToggleEnabled).toHaveBeenCalledWith(true);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("рисует редактор в раскрытом состоянии", () => {
    // Обрабатываем конструкцию: render.
    render(<GameCard game={game()} expanded {...handlers} />);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(screen.getByLabelText("Название")).toBeTruthy();
    // Обрабатываем конструкцию: expect.
    expect(screen.getByText("Домены")).toBeTruthy();
    // Обрабатываем конструкцию: expect.
    expect(screen.getByText("Порты")).toBeTruthy();
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("передаёт правки вверх", async () => {
    // Обрабатываем конструкцию: const onChange = vi.fn().
    const onChange = vi.fn();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: render.
    render(
      // Рендерим самозакрывающийся элемент GameCard.
      <GameCard game={game()} expanded {...handlers} onChange={onChange} />
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const input = screen.getByLabelText(Название).
    const input = screen.getByLabelText("Название");
    // — разделитель логических блоков —

    // Ожидаем завершение асинхронной операции await userEvent.clear(input).
    await userEvent.clear(input);
    // Ожидаем завершение асинхронной операции await userEvent.type(input, X).
    await userEvent.type(input, "X");
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(onChange).toHaveBeenCalled();
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —
