// Импортируем зависимости из модуля @testing-library/react.
import { render, screen, waitFor } from "@testing-library/react";
// Импортируем зависимости из модуля @testing-library/user-event.
import userEvent from "@testing-library/user-event";
// Импортируем зависимости из модуля vitest.
import { describe, expect, it, vi } from "vitest";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/components/settings/games/InstalledGamesGrid.
import InstalledGamesGrid from "@/components/settings/games/InstalledGamesGrid";
// Импортируем зависимости из модуля @/components/settings/games/GamePlayOverlay.
import GamePlayOverlay from "@/components/settings/games/GamePlayOverlay";
// Импортируем зависимости из модуля @/stores/useInstalledGamesStore.
import { useInstalledGamesStore } from "@/stores/useInstalledGamesStore";
// Импортируем зависимости из модуля @/types.
import type { InstalledGame } from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: vi.
vi.mock("@/lib/gameScan", () => ({
  // Обрабатываем конструкцию: scanInstalledGames.
  scanInstalledGames: vi.fn(async () => []),
  // Обрабатываем конструкцию: startInstalledGamesScan.
  startInstalledGamesScan: vi.fn(),
  // Закрываем текущий блок.
}));
// — разделитель логических блоков —

// Обрабатываем конструкцию: vi.
vi.mock("@/i18n", () => ({
  // Обрабатываем конструкцию: useI18n.
  useI18n: () => ({
    // Обрабатываем конструкцию: t.
    t: (key: string) => key,
    // Обрабатываем конструкцию: language.
    language: "ru",
    // Обрабатываем конструкцию: setLanguage.
    setLanguage: vi.fn(),
    // Закрываем текущий блок.
  }),
  // Закрываем текущий блок.
}));
// — разделитель логических блоков —

// Обрабатываем конструкцию: const mockInvoke = vi.fn( async (_command: string, _arg….
const mockInvoke = vi.fn(
  // Обрабатываем конструкцию: async.
  async (_command: string, _args?: unknown): Promise<string | null> => null
  // Закрываем выражение или список аргументов.
);
// — разделитель логических блоков —

// Обрабатываем конструкцию: vi.
vi.mock("@tauri-apps/api/core", () => ({
  // Обрабатываем конструкцию: invoke.
  invoke: (command: string, args?: unknown) => mockInvoke(command, args),
  // Закрываем текущий блок.
}));
// — разделитель логических блоков —

// Объявляем функцию game.
function game(patch: Partial<InstalledGame> = {}): InstalledGame {
  // Возвращаем результат: { id: steam-portal, name: Portal, appid: 620, platform:….
  return {
    // Обрабатываем конструкцию: id.
    id: "steam-portal",
    // Обрабатываем конструкцию: name.
    name: "Portal",
    // Обрабатываем конструкцию: appid.
    appid: "620",
    // Обрабатываем конструкцию: platform.
    platform: "steam",
    // Обрабатываем конструкцию: source.
    source: "steam",
    // Обрабатываем конструкцию: installPath.
    installPath: "D:\\Steam\\Portal",
    // Обрабатываем конструкцию: executablePath.
    executablePath: "D:\\Steam\\Portal\\portal.exe",
    // Обрабатываем конструкцию: anticheat.
    anticheat: "none",
    // Обрабатываем конструкцию: launchCount.
    launchCount: 0,
    // Разворачиваем ...patch в коллекцию.
    ...patch,
    // Закрываем текущий блок.
  };
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Сохраняем пояснение разработчика: игра, у которой сканер не нашёл appid — обложка ищется по па…
/** игра, у которой сканер не нашёл appid — обложка ищется по папке и exe */
// Объявляем функцию withoutAppid.
function withoutAppid(): InstalledGame {
  // Обрабатываем конструкцию: const value = game().
  const value = game();
  // Обрабатываем конструкцию: const { appid: _appid, ...rest } = value.
  const { appid: _appid, ...rest } = value;
  // — разделитель логических блоков —

  // Возвращаем результат: { ...rest }.
  return { ...rest };
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("InstalledGamesGrid", () => {
  // Обрабатываем конструкцию: it.
  it("рисует карточку с названием и бейджами", () => {
    // Обрабатываем конструкцию: render.
    render(
      // Рендерим самозакрывающийся элемент InstalledGamesGrid.
      <InstalledGamesGrid
        // Обрабатываем конструкцию: games.
        games={[game()]}
        // Обрабатываем конструкцию: bypassByGameId.
        bypassByGameId={{ "steam-portal": true }}
        // Обрабатываем конструкцию: launchingId.
        launchingId={null}
        // Задаём атрибут motionDisabled элемента.
        motionDisabled
        // Обрабатываем конструкцию: onLaunch.
        onLaunch={vi.fn()}
        // Обрабатываем конструкцию: onRemove.
        onRemove={vi.fn()}
        // Обрабатываем конструкцию: onCloseGame.
        onCloseGame={vi.fn()}
        // Обрабатываем конструкцию: onDiagnose.
        onDiagnose={vi.fn()}
        // Обрабатываем конструкцию: onChangeLaunchMode.
        onChangeLaunchMode={vi.fn()}
        // Обрабатываем конструкцию: runningGameIds.
        runningGameIds={{}}
        // Обрабатываем конструкцию: runningByPath.
        runningByPath={{}}
        // Продолжаем выражение.
      />
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(screen.getByTestId("installed-games-grid")).toBeInTheDocument();
    // Обрабатываем конструкцию: expect.
    expect(screen.getByText("Portal")).toBeInTheDocument();
    // Обрабатываем конструкцию: expect.
    expect(
      // Обрабатываем конструкцию: screen.
      screen.getByText("settings.games.installed.badge.bypassOn")
      // Закрываем выражение или список аргументов.
    ).toBeInTheDocument();
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("показывает бейдж «без обхода» для выключенного обхода", () => {
    // Обрабатываем конструкцию: render.
    render(
      // Рендерим самозакрывающийся элемент InstalledGamesGrid.
      <InstalledGamesGrid
        // Обрабатываем конструкцию: games.
        games={[game()]}
        // Обрабатываем конструкцию: bypassByGameId.
        bypassByGameId={{ "steam-portal": false }}
        // Обрабатываем конструкцию: launchingId.
        launchingId={null}
        // Задаём атрибут motionDisabled элемента.
        motionDisabled
        // Обрабатываем конструкцию: onLaunch.
        onLaunch={vi.fn()}
        // Обрабатываем конструкцию: onRemove.
        onRemove={vi.fn()}
        // Обрабатываем конструкцию: onCloseGame.
        onCloseGame={vi.fn()}
        // Обрабатываем конструкцию: onDiagnose.
        onDiagnose={vi.fn()}
        // Обрабатываем конструкцию: onChangeLaunchMode.
        onChangeLaunchMode={vi.fn()}
        // Обрабатываем конструкцию: runningGameIds.
        runningGameIds={{}}
        // Обрабатываем конструкцию: runningByPath.
        runningByPath={{}}
        // Продолжаем выражение.
      />
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(
      // Обрабатываем конструкцию: screen.
      screen.getByText("settings.games.installed.badge.bypassOff")
      // Закрываем выражение или список аргументов.
    ).toBeInTheDocument();
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("запрашивает обложку через команду game_cover", () => {
    // Обрабатываем конструкцию: render.
    render(
      // Рендерим самозакрывающийся элемент InstalledGamesGrid.
      <InstalledGamesGrid
        // Обрабатываем конструкцию: games.
        games={[game()]}
        // Обрабатываем конструкцию: bypassByGameId.
        bypassByGameId={{}}
        // Обрабатываем конструкцию: launchingId.
        launchingId={null}
        // Задаём атрибут motionDisabled элемента.
        motionDisabled
        // Обрабатываем конструкцию: onLaunch.
        onLaunch={vi.fn()}
        // Обрабатываем конструкцию: onRemove.
        onRemove={vi.fn()}
        // Обрабатываем конструкцию: onCloseGame.
        onCloseGame={vi.fn()}
        // Обрабатываем конструкцию: onDiagnose.
        onDiagnose={vi.fn()}
        // Обрабатываем конструкцию: onChangeLaunchMode.
        onChangeLaunchMode={vi.fn()}
        // Обрабатываем конструкцию: runningGameIds.
        runningGameIds={{}}
        // Обрабатываем конструкцию: runningByPath.
        runningByPath={{}}
        // Продолжаем выражение.
      />
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(mockInvoke).toHaveBeenCalledWith("game_cover", {
      // Обрабатываем конструкцию: appid.
      appid: "620",
      // Обрабатываем конструкцию: cover.
      cover: null,
      // Закрываем текущий блок.
    });
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("берёт обложку из папки игры, если у игры нет appid", async () => {
    // Обрабатываем конструкцию: render.
    render(
      // Рендерим самозакрывающийся элемент InstalledGamesGrid.
      <InstalledGamesGrid
        // Обрабатываем конструкцию: games.
        games={[withoutAppid()]}
        // Обрабатываем конструкцию: bypassByGameId.
        bypassByGameId={{}}
        // Обрабатываем конструкцию: launchingId.
        launchingId={null}
        // Задаём атрибут motionDisabled элемента.
        motionDisabled
        // Обрабатываем конструкцию: onLaunch.
        onLaunch={vi.fn()}
        // Обрабатываем конструкцию: onRemove.
        onRemove={vi.fn()}
        // Обрабатываем конструкцию: onCloseGame.
        onCloseGame={vi.fn()}
        // Обрабатываем конструкцию: onDiagnose.
        onDiagnose={vi.fn()}
        // Обрабатываем конструкцию: onChangeLaunchMode.
        onChangeLaunchMode={vi.fn()}
        // Обрабатываем конструкцию: runningGameIds.
        runningGameIds={{}}
        // Обрабатываем конструкцию: runningByPath.
        runningByPath={{}}
        // Продолжаем выражение.
      />
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Ожидаем завершение асинхронной операции await waitFor(() => { expect(mockInvoke).toHa….
    await waitFor(() => {
      // Обрабатываем конструкцию: expect.
      expect(mockInvoke).toHaveBeenCalledWith("game_folder_cover", {
        // Обрабатываем конструкцию: dir.
        dir: "D:\\Steam\\Portal",
        // Закрываем текущий блок.
      });
      // Закрываем текущий блок.
    });
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("не ходит в сеть, если нашлась иконка exe", async () => {
    // Обрабатываем конструкцию: mockInvoke.
    mockInvoke.mockImplementation(async (command: string) => {
      // Проверяем бизнес-условие: command === game_exe_icon.
      if (command === "game_exe_icon") {
        // Возвращаем результат: data:image/png;base64,iVBORw0KGgo=.
        return "data:image/png;base64,iVBORw0KGgo=";
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Возвращаем результат: null.
      return null;
      // Закрываем текущий блок.
    });
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: render.
    render(
      // Рендерим самозакрывающийся элемент InstalledGamesGrid.
      <InstalledGamesGrid
        // Обрабатываем конструкцию: games.
        games={[withoutAppid()]}
        // Обрабатываем конструкцию: bypassByGameId.
        bypassByGameId={{}}
        // Обрабатываем конструкцию: launchingId.
        launchingId={null}
        // Задаём атрибут motionDisabled элемента.
        motionDisabled
        // Обрабатываем конструкцию: onLaunch.
        onLaunch={vi.fn()}
        // Обрабатываем конструкцию: onRemove.
        onRemove={vi.fn()}
        // Обрабатываем конструкцию: onCloseGame.
        onCloseGame={vi.fn()}
        // Обрабатываем конструкцию: onDiagnose.
        onDiagnose={vi.fn()}
        // Обрабатываем конструкцию: onChangeLaunchMode.
        onChangeLaunchMode={vi.fn()}
        // Обрабатываем конструкцию: runningGameIds.
        runningGameIds={{}}
        // Обрабатываем конструкцию: runningByPath.
        runningByPath={{}}
        // Продолжаем выражение.
      />
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Ожидаем завершение асинхронной операции await waitFor(() => { expect(screen.getByRole….
    await waitFor(() => {
      // Обрабатываем конструкцию: expect.
      expect(screen.getByRole("img", { hidden: true })).toBeInTheDocument();
      // Закрываем текущий блок.
    });
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(mockInvoke).not.toHaveBeenCalledWith(
      // Обрабатываем конструкцию: game_steam_cover.
      "game_steam_cover",
      // Обрабатываем конструкцию: expect.
      expect.anything()
      // Закрываем выражение или список аргументов.
    );
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("позволяет убрать найденную игру, а не только добавленную вручную", async () => {
    // Обрабатываем конструкцию: const onRemove = vi.fn().
    const onRemove = vi.fn();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: render.
    render(
      // Рендерим самозакрывающийся элемент InstalledGamesGrid.
      <InstalledGamesGrid
        // Обрабатываем конструкцию: games.
        games={[game()]}
        // Обрабатываем конструкцию: bypassByGameId.
        bypassByGameId={{}}
        // Обрабатываем конструкцию: launchingId.
        launchingId={null}
        // Задаём атрибут motionDisabled элемента.
        motionDisabled
        // Обрабатываем конструкцию: onLaunch.
        onLaunch={vi.fn()}
        // Обрабатываем конструкцию: onRemove.
        onRemove={onRemove}
        // Обрабатываем конструкцию: onCloseGame.
        onCloseGame={vi.fn()}
        // Обрабатываем конструкцию: onDiagnose.
        onDiagnose={vi.fn()}
        // Обрабатываем конструкцию: onChangeLaunchMode.
        onChangeLaunchMode={vi.fn()}
        // Обрабатываем конструкцию: runningGameIds.
        runningGameIds={{}}
        // Обрабатываем конструкцию: runningByPath.
        runningByPath={{}}
        // Продолжаем выражение.
      />
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Ожидаем завершение асинхронной операции await userEvent.click( screen.getByLabelText(….
    await userEvent.click(
      // Обрабатываем конструкцию: screen.
      screen.getByLabelText("settings.games.installed.removeGame")
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(onRemove).toHaveBeenCalledTimes(1);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("передаёт игру в обработчик запуска", async () => {
    // Обрабатываем конструкцию: const onLaunch = vi.fn().
    const onLaunch = vi.fn();
    // Обрабатываем конструкцию: const target = game().
    const target = game();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: render.
    render(
      // Рендерим самозакрывающийся элемент InstalledGamesGrid.
      <InstalledGamesGrid
        // Обрабатываем конструкцию: games.
        games={[target]}
        // Обрабатываем конструкцию: bypassByGameId.
        bypassByGameId={{}}
        // Обрабатываем конструкцию: launchingId.
        launchingId={null}
        // Задаём атрибут motionDisabled элемента.
        motionDisabled
        // Обрабатываем конструкцию: onLaunch.
        onLaunch={onLaunch}
        // Обрабатываем конструкцию: onRemove.
        onRemove={vi.fn()}
        // Обрабатываем конструкцию: onCloseGame.
        onCloseGame={vi.fn()}
        // Обрабатываем конструкцию: onDiagnose.
        onDiagnose={vi.fn()}
        // Обрабатываем конструкцию: onChangeLaunchMode.
        onChangeLaunchMode={vi.fn()}
        // Обрабатываем конструкцию: runningGameIds.
        runningGameIds={{}}
        // Обрабатываем конструкцию: runningByPath.
        runningByPath={{}}
        // Продолжаем выражение.
      />
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Ожидаем завершение асинхронной операции await userEvent.hover(screen.getByTestId(inst….
    await userEvent.hover(screen.getByTestId("installed-game-card"));
    // Ожидаем завершение асинхронной операции await userEvent.click( screen.getByLabelText(….
    await userEvent.click(
      // Обрабатываем конструкцию: screen.
      screen.getByLabelText("settings.games.installed.launch.action")
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(onLaunch).toHaveBeenCalledWith(target);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("рисует по карточке на каждую игру", () => {
    // Обрабатываем конструкцию: render.
    render(
      // Рендерим самозакрывающийся элемент InstalledGamesGrid.
      <InstalledGamesGrid
        // Обрабатываем конструкцию: games.
        games={[
          // Обрабатываем конструкцию: game.
          game(),
          // Обрабатываем конструкцию: game.
          game({
            // Обрабатываем конструкцию: id.
            id: "custom-x",
            // Обрабатываем конструкцию: name.
            name: "Second",
            // Обрабатываем конструкцию: executablePath.
            executablePath: "C:\\B\\b.exe",
            // Закрываем текущий блок.
          }),
          // Закрываем массив или список.
        ]}
        // Обрабатываем конструкцию: bypassByGameId.
        bypassByGameId={{}}
        // Обрабатываем конструкцию: launchingId.
        launchingId={null}
        // Задаём атрибут motionDisabled элемента.
        motionDisabled
        // Обрабатываем конструкцию: onLaunch.
        onLaunch={vi.fn()}
        // Обрабатываем конструкцию: onRemove.
        onRemove={vi.fn()}
        // Обрабатываем конструкцию: onCloseGame.
        onCloseGame={vi.fn()}
        // Обрабатываем конструкцию: onDiagnose.
        onDiagnose={vi.fn()}
        // Обрабатываем конструкцию: onChangeLaunchMode.
        onChangeLaunchMode={vi.fn()}
        // Обрабатываем конструкцию: runningGameIds.
        runningGameIds={{}}
        // Обрабатываем конструкцию: runningByPath.
        runningByPath={{}}
        // Продолжаем выражение.
      />
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(screen.getAllByTestId("installed-game-card")).toHaveLength(2);
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("GamePlayOverlay", () => {
  // Обрабатываем конструкцию: it.
  it("не показывает кнопку вне hover", () => {
    // Обрабатываем конструкцию: render.
    render(
      // Рендерим самозакрывающийся элемент GamePlayOverlay.
      <GamePlayOverlay
        // Обрабатываем конструкцию: visible.
        visible={false}
        // Обрабатываем конструкцию: busy.
        busy={false}
        // Обрабатываем конструкцию: label.
        label="Запустить"
        // Задаём атрибут motionDisabled элемента.
        motionDisabled
        // Обрабатываем конструкцию: onLaunch.
        onLaunch={vi.fn()}
        // Продолжаем выражение.
      />
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(screen.getByLabelText("Запустить")).toHaveAttribute("disabled");
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("вызывает onLaunch по клику", async () => {
    // Обрабатываем конструкцию: const onLaunch = vi.fn().
    const onLaunch = vi.fn();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: render.
    render(
      // Рендерим самозакрывающийся элемент GamePlayOverlay.
      <GamePlayOverlay
        // Задаём атрибут visible элемента.
        visible
        // Обрабатываем конструкцию: busy.
        busy={false}
        // Обрабатываем конструкцию: label.
        label="Запустить"
        // Задаём атрибут motionDisabled элемента.
        motionDisabled
        // Обрабатываем конструкцию: onLaunch.
        onLaunch={onLaunch}
        // Продолжаем выражение.
      />
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Ожидаем завершение асинхронной операции await userEvent.click(screen.getByLabelText(З….
    await userEvent.click(screen.getByLabelText("Запустить"));
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(onLaunch).toHaveBeenCalledTimes(1);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("блокирует кнопку во время запуска", () => {
    // Обрабатываем конструкцию: render.
    render(
      // Рендерим самозакрывающийся элемент GamePlayOverlay.
      <GamePlayOverlay
        // Задаём атрибут visible элемента.
        visible
        // Задаём атрибут busy элемента.
        busy
        // Обрабатываем конструкцию: label.
        label="Запустить"
        // Задаём атрибут motionDisabled элемента.
        motionDisabled
        // Обрабатываем конструкцию: onLaunch.
        onLaunch={vi.fn()}
        // Продолжаем выражение.
      />
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(screen.getByLabelText("Запустить")).toBeDisabled();
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("стор установленных игр в связке с сеткой", () => {
  // Обрабатываем конструкцию: it.
  it("отдаёт сохранённые игры в пропсы", () => {
    // Обрабатываем конструкцию: useInstalledGamesStore.
    useInstalledGamesStore.getState().addGame(game());
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(useInstalledGamesStore.getState().games).toHaveLength(1);
    // Обрабатываем конструкцию: useInstalledGamesStore.
    useInstalledGamesStore.setState({ games: [] });
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —
